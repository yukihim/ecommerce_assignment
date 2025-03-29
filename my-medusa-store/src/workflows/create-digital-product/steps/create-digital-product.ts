import {
  createStep,
  StepResponse
} from "@medusajs/framework/workflows-sdk"
import DigitalProductModuleService from "../../../modules/digital-product/service"
import { DIGITAL_PRODUCT_MODULE } from "../../../modules/digital-product"
import { AdminUpdateApplicationMethod } from "@medusajs/medusa/api/admin/promotions/validators"
import {addMonths } from "date-fns"

export type CreateDigitalProductStepInput = {
  name: string,
  created_date: Date,
  expired_date: Date
}

const createDigitalProductStep = createStep(
  "create-digital-product-step",
  async (data: CreateDigitalProductStepInput, { container }) => {
    const digitalProductModuleService: DigitalProductModuleService = 
      container.resolve(DIGITAL_PRODUCT_MODULE)

    data = {
      name: data.name,
      created_date: new Date(),
      expired_date: addMonths(new Date(), 1),
    }

    const digitalProduct = await digitalProductModuleService
      .createDigitalProducts(data)

    return new StepResponse({
      digital_product: digitalProduct
    }, {
      digital_product: digitalProduct
    })
  },
  async ({ digital_product }, { container }) => {
    const digitalProductModuleService: DigitalProductModuleService = 
      container.resolve(DIGITAL_PRODUCT_MODULE)
    
    await digitalProductModuleService.deleteDigitalProducts(
      digital_product.id
    )
  }
)

export default createDigitalProductStep