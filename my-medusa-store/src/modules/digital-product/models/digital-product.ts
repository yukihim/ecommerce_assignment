import { model } from "@medusajs/framework/utils"
import DigitalProductMedia from "./digital-product-media"
import DigitalProductOrder from "./digital-product-order"
import { addMonths } from "date-fns";

const DigitalProduct = model.define("digital_product", {
  id: model.id().primaryKey(),
  name: model.text(),
  created_date: model.dateTime(),
  expired_date: model.dateTime(),
  duration: model.number().default(1),
  medias: model.hasMany(() => DigitalProductMedia, {
    mappedBy: "digitalProduct"
  }),
  orders: model.manyToMany(() => DigitalProductOrder, {
    mappedBy: "products"
  }),

})
.cascades({
  delete: ["medias"]
})

export default DigitalProduct