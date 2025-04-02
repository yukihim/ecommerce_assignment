import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { getProductPrice } from "@lib/util/get-product-price"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getCustomerDigitalProducts } from "@lib/data/digital-products"
import { listOrders } from "@lib/data/orders"
import { retrieveCart } from "@lib/data/cart"
import { notFound } from "next/navigation"

import { Button, Table, Text } from "@medusajs/ui"
import PreviewPrice from "@modules/products/components/product-preview/price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ProductCategory } from "@medusajs/js-sdk/dist/admin/product-category"
import ProductActions from "@modules/products/components/product-actions"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

type PackageData = {
  numberOfToken: string | number
  speed: string
  description: string
  addendums: string[]
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })
  const productOrder = [
    "Basic Package",
    "Standard Package",
    "Premium Package",
    "Enterprise Package",
  ]
  const productList = products.sort(
    (a, b) => productOrder.indexOf(a.title) - productOrder.indexOf(b.title)
  )
  const mockData: Record<string, PackageData> = {
    // "Basic Package": {
    //   numberOfToken: 100,
    //   speed: "Average",
    //   description: "A fundamental CSM chatbot service with:",
    //   addendums: [
    //     "1. Escalation to Human",
    //     "2. Support for complex inquiries - Basic Information Provision to answer common customer questions.",
    //     "3. High Availability - Up to 24/7, with notifications in case of server downtime.",
    //   ],
    // },
    "Basic Package": {
      numberOfToken: 2000,
      speed: "High",
      description: "A fundamental CSM chatbot service with:",
      addendums: [
        "1. Escalation to Human",
        "2. Support for complex inquiries - Basic Information Provision to answer common customer questions.",
        "3. High Availability - Up to 24/7, with notifications in case of server downtime.",
      ],
    },
    "Premium Package": {
      numberOfToken: 10000,
      speed: "Very high",
      description: "Includes all Basic Package features, plus:",
      addendums: [
        "1. Real-Time Warehouse Information to keep customers updated on stock availability.",
        "2. Enhanced Personalization – The chatbot analyzes user intent and recommends relevant products and information to help increase revenue.",
        "3. Finetuning chatbot to adapt specifically to the client's product catalog and common customer questions for better customization",
      ],
    },
    "Enterprise Package": {
      numberOfToken: -1,
      speed: "Depend on contract",
      description:
        "A fully customized chatbot solution with all Premium features, plus:",
      addendums: [
        "1. Tailor-Made Chatbot Design to fit each business’s specific needs.",
        "2. Cloud-Based Hosting to ensure zero downtime.",
        "3. Omnichannel Support for seamless integration across multiple platforms.",
        "4. Priority Customer Support – Faster assistance for a flexible and specialized chatbot solution.",
      ],
    },
  }

  const ownedProducts = await getCustomerDigitalProducts()

  const cart = await retrieveCart().catch((error) => {
    return notFound()
  })

  const orders = await listOrders()

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    // <>
    //   <div className="grid grid-cols-1 w-full" data-testid="products-list">
    //     <div className="grid grid-cols-5 w-full gap-x-6 ">
    //       <div className="border-r-2"></div>
    //       {products.map((p) => {
    //         return (
    //           <div key={p.id}>
    //             <ProductPreview product={p} region={region} />
    //           </div>
    //         )
    //       })}
    //     </div>
    //     <div className="grid grid-cols-5 w-full gap-x-6 border-t-2 min-h-[50px] ">
    //       <Text className="border-r-2">Number of Token</Text>
    //     </div>
    //   </div>
    //   {totalPages > 1 && (
    //     <Pagination
    //       data-testid="product-pagination"
    //       page={page}
    //       totalPages={totalPages}
    //     />
    //   )}
    // </>
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell></Table.HeaderCell>
          <Table.HeaderCell>Price</Table.HeaderCell>
          <Table.HeaderCell>Number of Token</Table.HeaderCell>
          <Table.HeaderCell>Speed</Table.HeaderCell>
          <Table.HeaderCell>Action</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {productList.map((p, index) => {
          const { cheapestPrice } = getProductPrice({ product: p })
          return (
            <Table.Row
              key={p.id}
              className="[&_td:first-child]:max-w-[400px] [&_td:first-child]:min-w-[100px] [&_td:first-child]:whitespace-nowrap"
            >
              <Table.Cell className="grid grid-cols-1 min-h-[200px] h-full text-wrap content-start txt-compact-medium p-3">
                <Text
                  className="text-2xl text-ui-fg-subtle"
                  data-testid="product-title"
                >
                  <b>{p.title}</b>
                </Text>
                <div className="w-full h-1 bg-gray-400" />
                <Text className="text-ui-fg-subtle mt-2 place-content-start min-h-[100px] text-wrap">
                  {mockData[p.title].description}
                  {mockData[p.title].addendums.map((addendum, index) => (
                    <ul key={index}>{addendum}</ul>
                  ))}
                </Text>
              </Table.Cell>
              <Table.Cell>
                {cheapestPrice ? (
                  <PreviewPrice price={cheapestPrice} />
                ) : p.title == "Enterprise Package" ? (
                  "Depend on Contract"
                ) : (
                  "Free"
                )}
              </Table.Cell>
              <Table.Cell>
                {mockData[p.title].numberOfToken == -1
                  ? "Depend on contract"
                  : mockData[p.title].numberOfToken}
              </Table.Cell>
              <Table.Cell>{mockData[p.title].speed}</Table.Cell>
              <Table.Cell className="justify-items-stretch">
                {p.title == "Enterprise Package" ? (
                  <Button variant="secondary" className="w-full h-10">
                    Contact Us
                  </Button>
                ) : !!ownedProducts &&
                  ownedProducts.find((o) => {
                    return p.title === o.name
                  }) ? (
                  <Text className="text-center text-wrap w-[150px] justify-self-center">
                    You have already subscribed to this plan.
                  </Text>
                ) : orders.some((order) => {
                    return (
                      !!order.items &&
                      order.items.some((item) => {
                        return item.title == p.title
                      })
                    )
                  }) ? (
                  <Text className="text-center text-wrap w-[150px] justify-self-center">
                    Currently checking your order.
                  </Text>
                ) : cart?.items &&
                  cart.items.find((cItem) => {
                    return cItem.product_title == p.title
                  }) ? (
                  <Text className="text-center text-wrap w-[150px] justify-self-center">
                    Currently in cart.
                  </Text>
                ) : (
                  <ProductActions disabled={true} product={p} region={region} />
                )}
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
