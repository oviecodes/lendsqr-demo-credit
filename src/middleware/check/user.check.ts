import { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors"
import users from "../../services/user"
import { differenceInYears } from "date-fns/fp"
import db from "../../connectors/knex.connector"

export const checkPreviousProfileImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await users.usersService.getProfilePics(req.user.id)
    if (!user) return next(createHttpError.NotFound("Resource not found"))

    if (req.files) req.files.previousKey = user.imageKey

    next()
  } catch (e: any) {
    return next(createHttpError(e))
  }
}

export const checkUserAge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { DOB } = req.body

    const age = differenceInYears(new Date(DOB), new Date())
    if (age < 18) return next(createHttpError.NotFound("Invalid age range"))
    req.body.age = age
    return next()
  } catch (e: any) {
    return next(createHttpError(e))
  }
}

export const checkUserLocationAndBuildingUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { location, building } = req.body

    if (location) {
      // get neighbourhoodId for adminWardCode
      const neighbourhood = await db
        .table("Neighbourhood")
        .where("adminWardCode", location.adminWardCode)
        .first()

      if (!neighbourhood)
        return next(createHttpError.NotFound("Invalid admin ward code"))

      const neighbourhoodForum = await db
        .table("Forum")
        .join("CommunityForum", "Forum.id", "CommunityForum.forumId")
        .where("CommunityForum.neighbourhoodId", neighbourhood.id)
        .select("Forum.id as id")
        .first()

      req.body.location.neighbourhoodForumId = neighbourhoodForum.id
      req.body.location.neighbourhoodId = neighbourhood.id

      const userLocation = await db
        .table("UserLocation")
        .where("userId", req.user.id)
        .first()

      userLocation
        ? (req.body.locationAction = "update")
        : (req.body.locationAction = "create")

      //get neighbourhoodId forumId
    }

    if (building) {
      const userBuilding = await db
        .table("UserBuilding")
        .where("userId", req.user.id)
        .first()

      userBuilding
        ? (req.body.buildingAction = "update")
        : (req.body.buildingAction = "create")

      //get building forumId
      const buildingForum = await db
        .table("Forum")
        .join("BuildingForum", "Forum.id", "BuildingForum.forumId")
        .where("BuildingForum.buildingId", building.buildingId)
        .select("Forum.id as id")
        .first()

      console.log("buildingForum", buildingForum)

      req.body.building.buildingForumId = buildingForum.id
    }

    return next()
  } catch (e: any) {
    return next(createHttpError(e))
  }
}
