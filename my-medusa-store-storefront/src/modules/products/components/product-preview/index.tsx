import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper">
        {/* <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        /> */}
        <div className="grid grid-cols-1 min-h-[200px] content-start txt-compact-medium mt-4 p-3 justify-between border-2 shadow-lg rounded-lg transition-transform duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:bg-gray-200">
          <Text
            className="text-2xl text-ui-fg-subtle"
            data-testid="product-title"
          >
            <b>{product.title}</b>
          </Text>
          <div className="w-full h-1 bg-gray-400 " />
          <Text className="text-ui-fg-subtle mt-2 place-content-start min-h-[100px]">
            {product.description}
          </Text>
          <div className="flex self-end items-center gap-x-2 mt-2">
            {cheapestPrice ? (
              <PreviewPrice price={cheapestPrice} />
            ) : product.title == "Enterprise Package" ? (
              "Depend on contract"
            ) : (
              "Free"
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
