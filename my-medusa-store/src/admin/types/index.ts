import { 
  OrderDTO,
  CustomerDTO
} from "@medusajs/framework/types"

export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
  EXPIRED = "expired",
  FAILED = "failed"
}

export enum SubscriptionInterval {
  MONTHLY = "monthly",
  YEARLY = "yearly"
}

export type SubscriptionData = {
  id: string
  status: SubscriptionStatus
  interval: SubscriptionInterval
  subscription_date: string
  last_order_date: string
  next_order_date: string | null
  expiration_date: string
  metadata: Record<string, unknown> | null
  orders?: OrderDTO[]
  customer?: CustomerDTO
}

import { ProductVariantDTO } from "@medusajs/framework/types"

export enum MediaType {
  MAIN = "main",
  PREVIEW = "preview"
}

export type DigitalProductMedia = {
  id: string
  type: MediaType
  fileId: string
  mimeType: string
  digitalProducts?: DigitalProduct
}

export type DigitalProduct = {
  id: string
  name: string
  medias?: DigitalProductMedia[]
  product_variant?:ProductVariantDTO
}