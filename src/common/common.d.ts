import { Knex } from "knex"

export interface Config {
  AWS_BUCKET: string
  ACCESS_TOKEN_SECRET: string
  REFRESH_TOKEN_SECRET: string
  AUTH_ISSUER_BASE_URL: string
  BUSINESS_ACCESS_TOKEN_SECRET: string
  BUSINESS_REFRESH_TOKEN_SECRET: string
  OTPSECRET: string
  ENCRYPTION_KEY: string
  MAIL_SENDER_EMAIL: string
  MAIL_SENDER_NAME: string
  MAIL_HOST: string
  MAIL_PORT: string
  MAIL_USERNAME: string
  MAIL_PASSWORD: string
  AWS_SECRET_KEY: string
  AWS_ACCESS_KEY: string
  AWS_REGION: string
  CONTACT_MAIL: string
  BUSINESS_FRONTEND_URL: string
}

export interface User {
  id: string
  email: string
  verified: Boolean
  resihubUserId: string
  buildingForumId: string
  communityForumId: string
  buildingId: string
  neighbourhoodId: string
  councilId: string
}

export interface Business {
  id: string
  email: string
  resihubBusinessId: string
}

export interface OnBoarding {
  id?: number
  question: string
  options: { id?: number; value: string; testEffect?: number; qid?: number }[]
}

export interface OnBoardingAnswers {
  question: string
  questionId: number
  answers: {
    optionId: number
    option: string
  }[]
}

export type AuthInput = {
  email: string
  password?: string
  secret?: string
  id?: number
  newDevice?: boolean
}

export interface Auth {
  strategy: AuthStrategy
  register: (data: AuthInput) => Promise<string>
  login: (data: AuthInput) => Promise<any>
  tokens: (data: any) => Promise<{ refreshToken: string; accessToken: string }>
  completeAuth: (data: AuthInput, newDevice: boolean) => Promise<any>
  generateOTP: (data: any, name?: boolean) => Promise<any>
}

export interface AuthStrategy {
  register: (data: AuthInput) => Promise<any>
  login: (
    data: AuthInput
  ) => Promise<{ email: string; id: string; resourceId: string }>
  completeAuth: (data: AuthInput, newDevice: boolean) => Promise<any>
  tokens: (data: any) => Promise<{ refreshToken: string; accessToken: string }>
  verifyRefreshToken: (data: any) => Promise<any>
  verifyAccessToken: (data: any) => Promise<any>
  logout: (data: any) => Promise<any>
  generateOTP: (data: any) => Promise<any>
  forgotPassword: (data: any) => Promise<any>
  resetPassword: (data: any) => Promise<any>
}

export interface QuizData {
  title: string
  questions: {
    question: string
    points: number
    options: {
      option: string
      correct?: boolean
    }[]
  }[]
}

// export interface ResultLib {
//   strategy: string
// }

// export interface Provider {
//   getResults: (
//     data: ProviderConfig | ProviderUrl,
//     url?: string
//   ) => Promise<{ name: any; date: any; result: any }>
//   checkUrl: (url: string) => Boolean
//   getConfig: () => ProviderConfig | ProviderUrl
// }

// export interface ProviderConfig {
//   NAME_SELECTOR: string
//   DATE_SELECTOR: string
//   STATUS_SELECTOR: string
//   INFECTION_SELECTOR: string
//   OFFSET: number
//   MULTI_SELECTOR_CLASS: boolean
//   MULTI_SELECTOR_INDEX: number
//   LENGTH_SELECTOR_COUNT: string
//   INFECTION_BODY_SEPARATOR: string
//   STATUS_BODY_SEPARATOR: string | null
// }

// export interface ProviderUrl {
//   url: string
// }

interface CreateForumPostData {
  content: string
  userId: string
  forumId: string
  files?: any
}

interface GetForumPostsOptions {
  forumId: string
  userId: string
  filters?: ForumFilters
  bookmarks?: boolean
}

interface GetSinglePostCommentsOptions {
  postId: string
  userId: string
  filters?: ForumFilters
}

interface GetSingleForumPostOptions {
  postId: string
  userId: string
}

interface CreateCommentData {
  content: string
  userId: string
  postId: string
  parentId?: string // Optional - for replies to comments
}

interface LikeCommentData {
  userId: string
  commentId: string
}

interface GetCommentOptions {
  commentId: string
  userId: string
}

interface ForumFilters {
  sort?: string
  search?: string
  timeRange?: "today" | "week" | "month" | "year" | "all"
  hasMedia?: boolean
  userId?: string // For filtering by author
  limit?: number
  currentPage?: number
}

interface VotePostData {
  userId: string
  postId: string
  voteType: "UP" | "DOWN"
}

interface ViewPostData {
  userId: string
  postId: string
}

interface CreateMarketplaceItemData {
  name: string
  description: string
  price: number
  condition: "NEW" | "USED"
  categoryId: string
  userId: string
  neighbourhoodId: string
  files?: any
}

interface UpdateMarketplaceItemData {
  name?: string
  description?: string
  price?: number
  condition?: "NEW" | "USED"
  categoryId?: string
  files?: any
  communityId: string
}

interface GetMarketplaceItemsOptions {
  neighbourhoodId?: string
  userId?: string
  itemId?: string
  criteria?: "my-items" | "all-items" | "single-item" | "saved-items"
  filters?: {
    search?: string
    categoryId?: string
    condition?: "NEW" | "USED"
    minPrice?: number
    maxPrice?: number
    status?: "AVAILABLE" | "SOLD"
    sort?: string
    limit?: number
    currentPage?: number
  }
}

interface CreateAdData {
  title: string
  description: string
  startDate: Date
  endDate: Date
  conditions?: string[]
  location?: string
  limitedOffer: boolean
  businessId: string
  files?: any | any[]
  publishNow?: boolean
  previousKey?: string
}

interface GetAdsOptions {
  businessId?: string
  id?: string
  filters?: {
    search?: string
    status?: "ACTIVE" | "SCHEDULED" | "EXPIRED"
    sort?: string
    limit?: number
    currentPage?: number
  }
}

// interface CreateCommentData {
//   adId: string
//   userId: string
//   content: string
// }

interface VoteAdData {
  adId: string
  userId: string
  voteType: "UP" | "DOWN"
}

interface GetAdStatsOptions {
  businessId: string
  filters?: {
    startDate?: Date
    endDate?: Date
    status?: "ACTIVE" | "SCHEDULED" | "EXPIRED"
    adId?: string
  }
}

interface SingleAdStatsFilters {
  startDate?: Date
  endDate?: Date
}

interface AdAnalytics {
  hourly: {
    views: AnalyticPoint[]
    impressions: AnalyticPoint[]
    clickThroughRate: AnalyticPoint[]
  }
  daily: {
    views: AnalyticPoint[]
    impressions: AnalyticPoint[]
    clickThroughRate: AnalyticPoint[]
  }
  summary: {
    totalViews: number
    totalImpressions: number
    averageClickThroughRate: number
  }
}

interface AnalyticPoint {
  timestamp: Date
  value: number
}

interface GetAdCommentsOptions {
  id: string
  filters?: {
    sort?: "newest" | "oldest"
    limit?: number
    page?: number
  }
}

interface GetAdVotesOptions {
  id: string
  type?: "UP" | "DOWN"
  limit?: number
  page?: number
}
