import { 
  validateAndTransformQuery,
  defineMiddlewares,
  validateAndTransformBody
} from "@medusajs/framework/http"
import { createDigitalProductsSchema } from "./validation-schemas"
import multer from "multer"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export const GetCustomSchema = createFindParams()
const upload = multer({ storage: multer.memoryStorage() })

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/subscriptions",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(
          GetCustomSchema,
          {
            defaults: [
              "id",
              "subscription_date",
              "expiration_date",
              "status",
              "metadata.*",
              "orders.*",
              "customer.*",
            ],
            isList: true,
          }
        ),
      ],
    },
	{
      matcher: "/admin/digital-products",
      method: "POST",
      middlewares: [
        validateAndTransformBody(createDigitalProductsSchema),
      ],
    },
    {
      matcher: "/admin/digital-products/upload**",
      method: "POST",
      middlewares: [
        upload.array("files"),
      ]
    }
  ],
})