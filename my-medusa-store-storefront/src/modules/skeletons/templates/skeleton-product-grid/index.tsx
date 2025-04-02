import repeat from "@lib/util/repeat"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

const SkeletonProductGrid = ({
  numberOfProducts = 8,
}: {
  numberOfProducts?: number
}) => {
  return (
    <ul
      className="grid grid-cols-1 gap-x-6 gap-y-8"
      data-testid="products-list-loader"
    >
      <li>
        <SkeletonProductPreview />
      </li>
    </ul>
  )
}

export default SkeletonProductGrid
