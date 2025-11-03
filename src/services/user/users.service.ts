import fs, { createReadStream } from "fs"
import path from "path"

import db from "../../connectors/knex.connector"
import randomstring, { generate } from "randomstring"
import createError from "http-errors"
import { config } from "../../common/config"
import { add, sub } from "date-fns"
import argon2 from "argon2"
// import { PDFKitUtils } from "../../utils/pdfkit.utils"
import { Knex } from "knex"

class UserService {
  async updateUser(userId: string, data: any) {
    await db.transaction(async (trx: Knex.Transaction) => {
      const { building, location, files, buildingAction, locationAction } = data

      const imageData = files

      delete data.location
      delete data.files
      delete data.building
      delete data.locationAction
      delete data.buildingAction

      if (Object.keys(data).length > 0) {
        await trx.table("User").where("id", userId).update(data)
      }

      const otherUpdates = []

      if (location) {
        const { neighbourhoodForumId, neighbourhoodId, address } = location
        if (locationAction === "update") {
          otherUpdates.push(
            trx
              .table("UserLocation")
              .where("userId", userId)
              .update({ neighbourhoodId, address }),
            trx
              .table("ForumMember")
              .where("userId", userId)
              .where("forumType", "COMMUNITY")
              .update({ forumId: neighbourhoodForumId }),
            await db.table("UserBuilding").where("userId", userId).delete(),
            await db
              .table("ForumMember")
              .where("userId", userId)
              .where("forumType", "BUILDING")
              .delete()
          )
        } else if (locationAction === "create") {
          otherUpdates.push(
            trx
              .table("UserLocation")
              .insert({ userId, neighbourhoodId, address }),
            trx.table("ForumMember").where("userId", userId).insert({
              userId,
              forumId: neighbourhoodForumId,
              forumType: "COMMUNITY",
            })
          )
        }
      }

      if (building) {
        const { buildingForumId, buildingId, apartmentNumber } = building
        if (buildingAction === "update") {
          otherUpdates.push(
            trx
              .table("UserBuilding")
              .where("userId", userId)
              .update({ buildingId, apartmentNumber }),
            trx
              .table("ForumMember")
              .where("userId", userId)
              .where("forumType", "BUILDING")
              .update({ forumId: buildingForumId })
          )
        } else if (buildingAction === "create") {
          otherUpdates.push(
            trx
              .table("UserBuilding")
              .insert({ userId, buildingId, apartmentNumber }),
            trx.table("ForumMember").where("userId", userId).insert({
              userId,
              forumId: buildingForumId,
              forumType: "BUILDING",
            })
          )
        }
      }

      if (otherUpdates.length > 0) await Promise.all(otherUpdates)

      if (imageData) {
        await this.uploadProfilePicture({
          files,
          userId,
        })
      }
    })
  }

  getUpdateObj(data: any) {
    const props = ["firstName", "lastName", "email"]

    const obj: any = {}

    Object.keys(data)
      .filter((el) => props.includes(el))
      .map((el) => {
        obj[el] = db.raw("pgp_sym_encrypt(?, ?)", [
          data[el],
          config.ENCRYPTION_KEY,
        ])
      })

    return obj
  }

  async updateUserPassword(data: {
    userId: number | string
    password: string
  }) {
    const password = argon2.hash(data.password)
    await db.table("User").where("userId", data.userId).update({ password })

    return
  }

  async uploadProfilePicture(data: { userId: number | string; files: any }) {
    const imageData = data.files.image
    const previousKey = data.files.previousKey
    delete data.files

    const ext = path.extname(imageData.name)

    if (imageData) {
      let key = randomstring.generate({
        charset: "alphanumeric",
        length: 16,
        capitalization: "lowercase",
      })

      key = `profilePictures/${key}-${Date.now()}${ext}`
    }
  }

  async me(userId: number | string) {
    return db.transaction(async (trx: Knex.Transaction) => {
      const data = await trx
        .table("User")
        .where("User.id", userId)
        .select([
          "User.id as id",
          "User.firstName",
          "User.lastName",
          "User.email",
          "User.imageKey",
          "User.imageUrl",
          "User.urlExp",
          "User.verified",
          // Building fields
          "Building.name as buildingName",
          "Building.id as buildingId",
          // Location fields
          "UserLocation.address",
          "Neighbourhood.id as neighbourhoodId",
          "Neighbourhood.adminWard as neighbourhoodAdminWard",
        ])
        .leftJoin("UserBuilding", "User.id", "UserBuilding.userId")
        .leftJoin("Building", "Building.id", "UserBuilding.buildingId")
        .leftJoin("UserLocation", "User.id", "UserLocation.userId")
        .leftJoin(
          "Neighbourhood",
          "UserLocation.neighbourhoodId",
          "Neighbourhood.id"
        )
        .first()

      // Restructure the flat data into the expected nested format
      return {
        userId: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        imageKey: data.imageKey,
        imageUrl: data.imageUrl,
        urlExp: data.urlExp,
        verified: data.verified,
        buildingData: data.buildingId
          ? {
              name: data.buildingName,
              buildingId: data.buildingId,
            }
          : null,
        userLocation: data.neighbourhoodId
          ? {
              address: data.address,
              neighbourhoodId: data.neighbourhoodId,
              neighbourhoodAdminWard: data.neighbourhoodAdminWard,
            }
          : null,
      }
    })

    // // check signedUrl expiry
    // let { imageUrl, imageKey, urlExp } = data[0]

    // if (new Date() > new Date(urlExp) && imageKey) {
    //   data[0].imageUrl = await S3Service.getSignedUrl(
    //     data[0].imageKey,
    //     7 * 24 * 60 * 60
    //   )

    //   await db
    //     .table("User")
    //     .where("id", userId)
    //     .update({
    //       imageUrl,
    //       urlExp: add(new Date(), {
    //         days: 7,
    //       }),
    //     })
    // }

    // delete data[0].imageKey
    // delete data[0].urlExp

    // // encrypt with public key
    // return data
  }

  async getUserBuildingForumId(userId: string | number) {
    return db
      .table("UserBuilding")
      .join(
        "BuildingForum",
        "UserBuilding.buildingId",
        "BuildingForum.buildingId"
      )
      .where("UserBuilding.userId", userId)
      .select("BuildingForum.forumId")
      .first()
  }

  async getUserCommunityForumId(userId: string | number) {
    return db
      .table("UserLocation")
      .join(
        "CommunityForum",
        "UserLocation.neighbourhoodId",
        "CommunityForum.neighbourhoodId"
      )
      .where("UserLocation.userId", userId)
      .select("CommunityForum.forumId")
      .first()
  }

  async findBy(field: string, value: string | number) {
    return db.table("User").where(`${field}`, value).select("id", "id").first()
  }

  async getUserEmail(userId: string | number): Promise<any> {
    return db.table("User").where("id", userId).select("email").first()
  }

  async getProfilePics(userId: string | number) {
    return db.table("User").where("id", userId).select("imageKey").first()
  }

  async getUserDeviceId(userId: string | number) {
    return db
      .table("UserMetadata")
      .where("userId", userId)
      .select(
        "id",
        db.raw(`pgp_sym_decrypt("deviceId"::bytea, ?) as "deviceId"`, [
          config.ENCRYPTION_KEY,
        ])
      )
  }

  async userDevices(userId: string | number) {
    return db
      .table("UserLoginActivity")
      .where("userId", userId)
      .orderBy("createdAt", "desc")
      .select(
        db.raw(`pgp_sym_decrypt("userAgent"::bytea, ?)`, [
          config.ENCRYPTION_KEY,
        ]),
        db.raw(`pgp_sym_decrypt("ipAddress"::bytea, ?)`, [
          config.ENCRYPTION_KEY,
        ]),
        "createdAt"
      )
  }

  async isForumMember(userId: string | number, forumId: string | number) {
    return db
      .table("ForumMember")
      .where("userId", userId)
      .where("forumId", forumId)
      .where("status", "ACTIVE")
      .first()
  }

  async updateNotificationSettings(data: { userId: string | number }) {
    const { userId, ...setting } = data

    await db
      .table("UserNotificationSetting")
      .where("userId", userId)
      .update(setting)
  }

  async getNotificationSettings(userId: string | number) {
    return db
      .table("UserNotificationSetting")
      .where("userId", userId)
      .select(
        "exposure",
        "statusShare",
        "testInterval",
        "quiz",
        "STIstatus",
        "trustCircle"
      )
  }
}

export default new UserService()
