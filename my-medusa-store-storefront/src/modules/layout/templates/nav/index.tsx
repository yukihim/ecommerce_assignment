import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import { getAuthHeaders } from "@lib/data/cookies"
import { Button } from "@medusajs/ui"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  const auth = !!{
    ...(await getAuthHeaders()),
  }.authorization

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} auth={auth} />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase font-extrabold tracking-widest"
              data-testid="nav-store-link"
            >
              CareBot
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="text-lg font-semibold text-black hover:text-cyan-400 transition-colors duration-300"
                href="/account"
                data-testid="nav-account-link"
              >
                {!auth ? (
                  <Button variant="primary" className="px-4 py-2 rounded-lg">
                    Get started
                  </Button>
                ) : (
                  <span className="hover:underline">Account</span>
                )}
              </LocalizedClientLink>
            </div>
            {auth && (
              <Suspense
                fallback={
                  <LocalizedClientLink
                    className="text-lg font-semibold text-white flex gap-2 hover:text-cyan-400 transition-colors duration-300"
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    <span className="hover:underline">Cart (0)</span>
                  </LocalizedClientLink>
                }
              >
                <CartButton />
              </Suspense>
            )}
          </div>
        </nav>
      </header>
    </div>
  )
}
