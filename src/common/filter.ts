import { Knex } from "knex"

interface FilterOptions {
  sort?: string
  search?: string
  timeRange?: "today" | "week" | "month" | "year" | "all"
  hasMedia?: boolean
  userId?: string
  startDate?: Date
  endDate?: Date
  status?: string
  type?: string
  [key: string]: any
}

interface ResourceConfig {
  searchColumns?: string[]
  sortColumns?: {
    [key: string]: { column: string; direction: string }
  }
  defaultSort?: { column: string; direction: string }
}

const TIME_RANGES = {
  today: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
} as const

const DEFAULT_RESOURCE_CONFIG: ResourceConfig = {
  searchColumns: ["content"],
  sortColumns: {
    "z-to-a": { column: "content", direction: "desc" },
    "a-to-z": { column: "content", direction: "asc" },
    "new-to-old": { column: "createdAt", direction: "desc" },
    "old-to-new": { column: "createdAt", direction: "asc" },
    "most-liked": { column: "likesCount", direction: "desc" },
    "most-commented": { column: "commentCount", direction: "desc" },
    trending: { column: "activityCount", direction: "desc" },
  },
  defaultSort: { column: "createdAt", direction: "desc" },
}

const RESOURCE_CONFIGS: { [key: string]: ResourceConfig } = {
  ForumPost: {
    searchColumns: ["content", "User.firstName", "User.lastName"],
    sortColumns: {
      "z-to-a": { column: "content", direction: "desc" },
      "a-to-z": { column: "content", direction: "asc" },
      "new-to-old": { column: "createdAt", direction: "desc" },
      "old-to-new": { column: "createdAt", direction: "asc" },
      "most-liked": { column: "upvoteCount", direction: "desc" },
      "most-commented": { column: "commentCount", direction: "desc" },
      trending: { column: "activityCount", direction: "desc" },
    },
    defaultSort: { column: "createdAt", direction: "desc" },
  },
  ForumComment: {
    searchColumns: ["content", "User.firstName", "User.lastName"],
    sortColumns: {
      "new-to-old": { column: "createdAt", direction: "desc" },
      "old-to-new": { column: "createdAt", direction: "asc" },
      "most-liked": { column: "likesCount", direction: "desc" },
    },
    defaultSort: { column: "createdAt", direction: "desc" },
  },
  MarketplaceItem: {
    searchColumns: ["name", "description"],
    sortColumns: {
      "price-low-high": { column: "price", direction: "asc" },
      "price-high-low": { column: "price", direction: "desc" },
      "new-to-old": { column: "createdAt", direction: "desc" },
      "old-to-new": { column: "createdAt", direction: "asc" },
    },
    defaultSort: { column: "createdAt", direction: "desc" },
  },
  Report: {
    searchColumns: ["title", "description"],
    sortColumns: {
      "most-recent": { column: "createdAt", direction: "desc" },
      oldest: { column: "createdAt", direction: "asc" },
      "most-liked": { column: "likeCount", direction: "desc" },
      "most-commented": { column: "commentCount", direction: "desc" },
      "least-liked": { column: "likeCount", direction: "asc" },
      "least-commented": { column: "commentCount", direction: "asc" },
      trending: { column: "activityCount", direction: "desc" },
    },
    defaultSort: { column: "createdAt", direction: "desc" },
  },
  BusinessAd: {
    searchColumns: ["title", "description"],
    sortColumns: {
      "z-to-a": { column: "title", direction: "desc" },
      "a-to-z": { column: "title", direction: "asc" },
      "new-to-old": { column: "createdAt", direction: "desc" },
      "old-to-new": { column: "createdAt", direction: "asc" },
      "most-liked": { column: "upvoteCount", direction: "desc" },
      "most-commented": { column: "commentCount", direction: "desc" },
      "most-viewed": { column: "viewCount", direction: "desc" },
      trending: { column: "activityCount", direction: "desc" },
    },
    defaultSort: { column: "createdAt", direction: "desc" },
  },
  AdsComment: {
    sortColumns: {
      newest: { column: "createdAt", direction: "desc" },
      oldest: { column: "createdAt", direction: "asc" },
    },
    defaultSort: { column: "createdAt", direction: "desc" },
  },
  AdsVote: {
    sortColumns: {
      newest: { column: "createdAt", direction: "desc" },
      oldest: { column: "createdAt", direction: "asc" },
    },
    defaultSort: { column: "createdAt", direction: "desc" },
  },
  // Add more resource configs as needed
}

const buildFilters = (options: FilterOptions, resource: string) => {
  // console.log("options", options)
  // console.log("resource", resource)

  const config = RESOURCE_CONFIGS[resource] || DEFAULT_RESOURCE_CONFIG
  const filters: Record<string, any> = {}

  filters.where = []
  filters.orderBy = []

  // Handle sorting
  if (
    options.sort &&
    (config.sortColumns?.[options.sort] || Array.isArray(options.sort))
  ) {
    // if sort is an array, we need to sort by multiple columns
    if (Array.isArray(options.sort)) {
      console.log("in arrray")
      options.sort.forEach((sort) => {
        const { column, direction } = config.sortColumns?.[sort] as any
        if (column && direction) {
          filters.orderBy.push([
            column === "createdAt" ? `${resource}.${column}` : column,
            direction,
          ])
        }
      })
    } else {
      console.log("in else")
      const { column, direction } = config.sortColumns?.[options.sort] as any
      filters.orderBy.push([
        column === "createdAt" ? `${resource}.${column}` : column,
        direction,
      ])
    }
  } else if (config.defaultSort) {
    // Default sorting
    filters.orderBy.push([
      `${resource}.${config.defaultSort.column}`,
      config.defaultSort.direction,
    ])
  }

  // Handle search
  if (options.search?.trim() && config.searchColumns?.length) {
    filters.where.push(
      config.searchColumns.map((column) => ({
        column,
        operator: "ilike",
        value: `%${options.search}%`,
      }))
    )
  }

  // Handle time range
  if (
    options.timeRange &&
    options.timeRange !== "all" &&
    TIME_RANGES[options.timeRange]
  ) {
    filters.where.push({
      column: `${resource}.createdAt`,
      operator: ">=",
      value: new Date(Date.now() - TIME_RANGES[options.timeRange]),
    })
  }

  // Handle date range
  if (options.startDate) {
    filters.where.push({
      column: `${resource}.createdAt`,
      operator: ">=",
      value: new Date(options.startDate),
    })
  }

  if (options.endDate) {
    filters.where.push({
      column: `${resource}.createdAt`,
      operator: "<=",
      value: new Date(options.endDate),
    })
  }

  // Handle media filter
  if (options.hasMedia !== undefined) {
    filters.where.push({
      column: `${resource}.imageUrl`,
      operator: options.hasMedia ? "IS NOT" : "IS",
      value: null,
    })
  }

  // Handle user filter
  if (options.userId) {
    filters.where.push({
      column: `${resource}.userId`,
      operator: "=",
      value: options.userId,
    })
  }

  // Handle status filter
  if (options.status) {
    filters.where.push({
      column: `${resource}.status`,
      operator: "=",
      value: options.status,
    })
  }

  if (options.categoryId) {
    let localResource = resource
    if (resource === "BusinessAd") {
      localResource = "Business"
    }

    if (Array.isArray(options.categoryId)) {
      filters.where.push({
        column: `${localResource}.categoryId`,
        operator: "in",
        value: options.categoryId,
      })
    } else {
      filters.where.push({
        column: `${localResource}.categoryId`,
        operator: "=",
        value: options.categoryId,
      })
    }
  }

  if (options.condition) {
    let conditionField = "condition"
    let localResource = resource
    if (resource === "BusinessAd") {
      localResource = "BusinessAdCondition"
      conditionField = "conditionId"
    }

    if (Array.isArray(options.condition)) {
      filters.where.push({
        column: `${localResource}.${conditionField}`,
        operator: "in",
        value: options.condition,
      })
    } else {
      filters.where.push({
        column: `${localResource}.${conditionField}`,
        operator: "=",
        value: options.condition,
      })
    }
  }

  if (options.minPrice) {
    filters.where.push({
      column: `${resource}.price`,
      operator: ">=",
      value: options.minPrice,
    })
  }

  if (options.maxPrice) {
    filters.where.push({
      column: `${resource}.price`,
      operator: "<=",
      value: options.maxPrice,
    })
  }

  // Handle type filter
  if (options.type) {
    filters.where.push({
      column: `${resource}.type`,
      operator: "=",
      value: options.type,
    })
  }

  if (options.limit) {
    filters.limit = options.limit
  }

  if (options.currentPage) {
    filters.currentPage = options.currentPage
  }

  return filters
}

const applyDynamicFilters = (
  query: Knex.QueryBuilder,
  filters: Record<string, any>
): Knex.QueryBuilder => {
  // Handle WHERE conditions
  if (filters.where?.length) {
    // Don't create a new builder, modify the existing one
    filters.where.forEach((condition: any) => {
      if (Array.isArray(condition)) {
        // Handle OR conditions
        query.where(function () {
          condition.forEach((orCondition) => {
            this.orWhere(
              orCondition.column,
              orCondition.operator,
              orCondition.value
            )
          })
        })
      } else {
        // Handle AND conditions
        query.where(condition.column, condition.operator, condition.value)
      }
    })
  }

  // Handle ORDER BY
  if (filters.orderBy?.length) {
    filters.orderBy.forEach(([column, direction]: [string, string]) => {
      query.orderBy(column, direction)
    })
  }

  return query
}

export { applyDynamicFilters, buildFilters, FilterOptions }
