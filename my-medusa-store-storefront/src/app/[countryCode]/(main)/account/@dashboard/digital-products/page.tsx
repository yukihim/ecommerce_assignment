import { Metadata } from "next"

import { getCustomerDigitalProducts } from "../../../../../../lib/data/digital-products"
import { DigitalProductsList } from "../../../../../../modules/account/components/digital-products-list"

export const metadata: Metadata = {
  title: "Subscription plan",
  description: "Overview of your purchased subscription plan.",
}

export default async function DigitalProducts() {
  const digitalProducts = await getCustomerDigitalProducts()

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Subscription plan</h1>
        <p className="text-base-regular">
          View the every subscription plans that you've purchased.
        </p>
      </div>
      <div>
        <DigitalProductsList digitalProducts={digitalProducts} />
      </div>
    </div>
  )
}
