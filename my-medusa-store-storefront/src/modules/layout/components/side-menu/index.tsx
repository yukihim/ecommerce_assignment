"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Bars3Icon } from "@heroicons/react/24/outline"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"

const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Account: "/account",
  Cart: "/cart",
}

const SideMenu = ({ regions }: { regions: HttpTypes.StoreRegion[] | null }) => {
  const toggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center focus:outline-none cursor-pointer"
                >
                  <Bars3Icon className="w-6 h-6 text-black" />
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200 transform"
                enterFrom="-translate-x-full opacity-0"
                enterTo="translate-x-0 opacity-100"
                leave="transition ease-in duration-200 transform"
                leaveFrom="translate-x-0 opacity-100"
                leaveTo="-translate-x-full opacity-0"
              >
                <PopoverPanel className="flex flex-col absolute w-2/3 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-30 inset-y-0 left-0 text-sm text-black bg-white shadow-xl p-6 border-r border-gray-300 rounded-r-lg">
                  <div className="flex justify-between items-center mb-4">
                    <Text className="text-xl font-semibold cursor-pointer hover:text-gray-700" onClick={close}>Menu</Text>
                    <button data-testid="close-menu-button" onClick={close} className="text-black hover:text-gray-700">
                      <XMark className="w-6 h-6" />
                    </button>
                  </div>
                  <ul className="flex flex-col gap-4 items-start justify-start">
                    {Object.entries(SideMenuItems).map(([name, href]) => {
                      return (
                        <li key={name} className="w-full">
                          <LocalizedClientLink
                            href={href}
                            className="text-xl leading-10 w-full px-2 py-1 rounded-md hover:bg-gray-200 hover:font-semibold transition-all"
                            onClick={close}
                            data-testid={`${name.toLowerCase()}-link`}
                          >
                            {name}
                          </LocalizedClientLink>
                        </li>
                      )
                    })}
                  </ul>
                  <div className="flex flex-col gap-y-6 mt-auto border-t border-gray-300 pt-4">
                    <div
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-200 p-2 rounded-md"
                      onMouseEnter={toggleState.open}
                      onMouseLeave={toggleState.close}
                    >
                      {regions && (
                        <CountrySelect
                          toggleState={toggleState}
                          regions={regions}
                        />
                      )}
                      <ArrowRightMini
                        className={clx(
                          "transition-transform duration-150",
                          toggleState.state ? "rotate-90" : ""
                        )}
                      />
                    </div>
                    <Text className="text-center text-gray-500 text-sm">
                      © {new Date().getFullYear()} Medusa Store. All rights reserved.
                    </Text>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
