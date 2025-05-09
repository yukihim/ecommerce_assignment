import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import createDigitalProductWorkflow from "../workflows/create-digital-product";
import {addMonths} from "date-fns";

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["vn", "kh", "la", "th", "my", "id", "sg"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: "vnd",
            is_default: true,
          },
          {
            currency_code: "eur",
          },
          {
            currency_code: "usd",
          },
          
          {
            currency_code: "khr",
          },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Southeast Asia",
          currency_code: "vnd",
          countries,
          payment_providers: ["pp_system_default", "pp_stripe_stripe"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Southeast Asia Warehouse",
          address: {
            city: "Ho Chi Minh",
            country_code: "VN",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default"
  })
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
    await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Default Shipping Profile",
            type: "default",
          },
        ],
      },
    });
    shippingProfile = shippingProfileResult[0];
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Southeast Asia Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Southeast Asia",
        geo_zones: [
          {
            country_code: "vn",
            type: "country",
          },
          {
            country_code: "kh",
            type: "country",
          },
          {
            country_code: "la",
            type: "country",
          },
          {
            country_code: "th",
            type: "country",
          },
          {
            country_code: "my",
            type: "country",
          },
          {
            country_code: "sg",
            type: "country",
          },
          {
            country_code: "id",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "No Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "No shipping.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 0,
          },
          {
            currency_code: "eur",
            amount: 0,
          },
          {
            currency_code: "vnd",
            amount: 0,
          },
          {
            currency_code: "khr",
            amount: 0,
          },
          {
            region_id: region.id,
            amount: 0,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      // {
      //   name: "Express Shipping",
      //   price_type: "flat",
      //   provider_id: "manual_manual",
      //   service_zone_id: fulfillmentSet.service_zones[0].id,
      //   shipping_profile_id: shippingProfile.id,
      //   type: {
      //     label: "Express",
      //     description: "Ship in 24 hours.",
      //     code: "express",
      //   },
      //   prices: [
      //     {
      //       currency_code: "usd",
      //       amount: 10,
      //     },
      //     {
      //       currency_code: "eur",
      //       amount: 10,
      //     },
      //     {
      //       region_id: region.id,
      //       amount: 10,
      //     },
      //   ],
      //   rules: [
      //     {
      //       attribute: "enabled_in_store",
      //       value: "true",
      //       operator: "eq",
      //     },
      //     {
      //       attribute: "is_return",
      //       value: "false",
      //       operator: "eq",
      //     },
      //   ],
      // },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "Webshop",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Shirts",
          is_active: true,
        },
        {
          name: "Sweatshirts",
          is_active: true,
        },
        {
          name: "Pants",
          is_active: true,
        },
        {
          name: "Merch",
          is_active: true,
        },
      ],
    },
  });

  // await createDigitalProductWorkflow(container).run({
  //   input: {
  //     digital_product: {
  //       name: "Basic Package",
  //       created_date: new Date(),
  //       expired_date: addMonths(new Date(), 1),
  //       medias: []
  //     },
  //     product: {
  //       title: "Basic Package",
  //       description:
  //         "Designed for small businesses, allowing them to experience the chatbot feature for free with a limited number of messages per month. Suitable for the startup stage",
  //       handle: "bpackage",
  //       weight: 400,
  //       status: ProductStatus.PUBLISHED,
  //       shipping_profile_id: shippingProfile.id,
  //       images: [],
  //       options: [{title: "default", values: ["default"]}],
  //       variants: [
  //         {
  //           title: "Basic Package",
  //           sku: "basic_package",
  //           options: {default: "default"},
  //           prices: [
  //             {
  //               amount: 0,
  //               currency_code: "vnd",
  //             },
  //             {
  //               amount: 0,
  //               currency_code: "khr",
  //             },
  //             {
  //               amount: 0,
  //               currency_code: "eur",
  //             },
  //             {
  //               amount: 0,
  //               currency_code: "usd",
  //             },
  //           ],
  //           manage_inventory: false,
  //         },
  //       ],
  //       sales_channels: [
  //         {
  //           id: defaultSalesChannel[0].id,
  //         },
  //       ],
  //     },
  //   }
  // })

  await createDigitalProductWorkflow(container).run({
    input: {
      digital_product: {
        name: "Basic Package",
        created_date: new Date(),
        expired_date: addMonths(new Date(), 1),
        medias: []
      },
      product: {
        title: "Basic Package",
        description: "",
        handle: "bpackage",
        weight: 400,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfile.id,
        images: [],
        options: [{title: "default", values: ["default"]}],
        variants: [
          {
            title: "Basic Package",
            sku: "bpackage",
            options: {default: "default"},
            prices: [
              {
                amount: 299000,
                currency_code: "vnd",
              },
              {
                amount: 1750000,
                currency_code: "khr",
              },
              {
                amount: 12,
                currency_code: "eur",
              },
              {
                amount: 12,
                currency_code: "usd",
              },
            ],
            manage_inventory: false,
          },
        ],
        sales_channels: [
          {
            id: defaultSalesChannel[0].id,
          },
        ],
      },
    }
  })

  await createDigitalProductWorkflow(container).run({
    input: {
      digital_product: {
        name: "Premium Package",
        created_date: new Date(),
        expired_date: addMonths(new Date(), 1),
        medias: []
      },
      product: {
        title: "Premium Package",
        description: "",
        handle: "ppackage",
        weight: 400,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfile.id,
        images: [],
        options: [{title: "default", values: ["default"]}],
        variants: [
          {
            title: "Premium Package",
            sku: "ppackage",
            options: {default: "default"},
            prices: [
              {
                amount: 499000,
                currency_code: "vnd",
              },
              {
                amount: 2800000,
                currency_code: "khr",
              },
              {
                amount: 20,
                currency_code: "eur",
              },
              {
                amount: 20,
                currency_code: "usd",
              },
            ],
            manage_inventory: false,
          },
        ],
        sales_channels: [
          {
            id: defaultSalesChannel[0].id,
          },
        ],
      },
    }
  })

  await createDigitalProductWorkflow(container).run({
    input: {
      digital_product: {
        name: "Enterprise Package",
        created_date: new Date(),
        expired_date: addMonths(new Date(), 1),
        medias: []
      },
      product: {
        title: "Enterprise Package",
        description:"",
        handle: "epackage",
        weight: 400,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfile.id,
        images: [],
        options: [{title: "default", values: ["default"]}],
        variants: [
          {
            title: "Enterprise Package",
            sku: "epackage",
            options: {default: "default"},
            prices: [
              {
                amount: 0,
                currency_code: "vnd",
              },
              {
                amount: 0,
                currency_code: "khr",
              },
              {
                amount: 0,
                currency_code: "eur",
              },
              {
                amount: 20,
                currency_code: "usd",
              },
            ],
            manage_inventory: false,
          },
        ],
        sales_channels: [
          {
            id: defaultSalesChannel[0].id,
          },
        ],
      },
    }
  })

  // await createProductsWorkflow(container).run({
  //   input: {
  //     products: [
  //       {
  //         title: "Medusa T-Shirt",
  //         category_ids: [
  //           categoryResult.find((cat) => cat.name === "Shirts")!.id,
  //         ],
  //         description:
  //           "Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.",
  //         handle: "t-shirt",
  //         weight: 400,
  //         status: ProductStatus.PUBLISHED,
  //         shipping_profile_id: shippingProfile.id,
  //         images: [
  //           {
  //             url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
  //           },
  //           {
  //             url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-back.png",
  //           },
  //           {
  //             url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
  //           },
  //           {
  //             url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-back.png",
  //           },
  //         ],
  //         options: [
  //           {
  //             title: "Size",
  //             values: ["S", "M", "L", "XL"],
  //           },
  //           {
  //             title: "Color",
  //             values: ["Black", "White"],
  //           },
  //         ],
  //         variants: [
  //           {
  //             title: "S / Black",
  //             sku: "SHIRT-S-BLACK",
  //             options: {
  //               Size: "S",
  //               Color: "Black",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "S / White",
  //             sku: "SHIRT-S-WHITE",
  //             options: {
  //               Size: "S",
  //               Color: "White",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "M / Black",
  //             sku: "SHIRT-M-BLACK",
  //             options: {
  //               Size: "M",
  //               Color: "Black",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "M / White",
  //             sku: "SHIRT-M-WHITE",
  //             options: {
  //               Size: "M",
  //               Color: "White",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "L / Black",
  //             sku: "SHIRT-L-BLACK",
  //             options: {
  //               Size: "L",
  //               Color: "Black",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "L / White",
  //             sku: "SHIRT-L-WHITE",
  //             options: {
  //               Size: "L",
  //               Color: "White",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "XL / Black",
  //             sku: "SHIRT-XL-BLACK",
  //             options: {
  //               Size: "XL",
  //               Color: "Black",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "XL / White",
  //             sku: "SHIRT-XL-WHITE",
  //             options: {
  //               Size: "XL",
  //               Color: "White",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //         ],
  //         sales_channels: [
  //           {
  //             id: defaultSalesChannel[0].id,
  //           },
  //         ],
  //       },
  //       {
  //         title: "Medusa Sweatshirt",
  //         category_ids: [
  //           categoryResult.find((cat) => cat.name === "Sweatshirts")!.id,
  //         ],
  //         description:
  //           "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.",
  //         handle: "sweatshirt",
  //         weight: 400,
  //         status: ProductStatus.PUBLISHED,
  //         shipping_profile_id: shippingProfile.id,
  //         images: [
  //           {
  //             url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
  //           },
  //           {
  //             url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png",
  //           },
  //         ],
  //         options: [
  //           {
  //             title: "Size",
  //             values: ["S", "M", "L", "XL"],
  //           },
  //         ],
  //         variants: [
  //           {
  //             title: "S",
  //             sku: "SWEATSHIRT-S",
  //             options: {
  //               Size: "S",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "M",
  //             sku: "SWEATSHIRT-M",
  //             options: {
  //               Size: "M",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "L",
  //             sku: "SWEATSHIRT-L",
  //             options: {
  //               Size: "L",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "XL",
  //             sku: "SWEATSHIRT-XL",
  //             options: {
  //               Size: "XL",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //         ],
  //         sales_channels: [
  //           {
  //             id: defaultSalesChannel[0].id,
  //           },
  //         ],
  //       },
  //       {
  //         title: "Medusa Sweatpants",
  //         category_ids: [
  //           categoryResult.find((cat) => cat.name === "Pants")!.id,
  //         ],
  //         description:
  //           "Reimagine the feeling of classic sweatpants. With our cotton sweatpants, everyday essentials no longer have to be ordinary.",
  //         handle: "sweatpants",
  //         weight: 400,
  //         status: ProductStatus.PUBLISHED,
  //         shipping_profile_id: shippingProfile.id,
  //         images: [
  //           {
  //             url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
  //           },
  //           {
  //             url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-back.png",
  //           },
  //         ],
  //         options: [
  //           {
  //             title: "Size",
  //             values: ["S", "M", "L", "XL"],
  //           },
  //         ],
  //         variants: [
  //           {
  //             title: "S",
  //             sku: "SWEATPANTS-S",
  //             options: {
  //               Size: "S",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "M",
  //             sku: "SWEATPANTS-M",
  //             options: {
  //               Size: "M",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "L",
  //             sku: "SWEATPANTS-L",
  //             options: {
  //               Size: "L",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "XL",
  //             sku: "SWEATPANTS-XL",
  //             options: {
  //               Size: "XL",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //         ],
  //         sales_channels: [
  //           {
  //             id: defaultSalesChannel[0].id,
  //           },
  //         ],
  //       },
  //       {
  //         title: "Medusa Shorts",
  //         category_ids: [
  //           categoryResult.find((cat) => cat.name === "Merch")!.id,
  //         ],
  //         description:
  //           "Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.",
  //         handle: "shorts",
  //         weight: 400,
  //         status: ProductStatus.PUBLISHED,
  //         shipping_profile_id: shippingProfile.id,
  //         images: [
  //           {
  //             url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
  //           },
  //           {
  //             url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-back.png",
  //           },
  //         ],
  //         options: [
  //           {
  //             title: "Size",
  //             values: ["S", "M", "L", "XL"],
  //           },
  //         ],
  //         variants: [
  //           {
  //             title: "S",
  //             sku: "SHORTS-S",
  //             options: {
  //               Size: "S",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "M",
  //             sku: "SHORTS-M",
  //             options: {
  //               Size: "M",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "L",
  //             sku: "SHORTS-L",
  //             options: {
  //               Size: "L",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //           {
  //             title: "XL",
  //             sku: "SHORTS-XL",
  //             options: {
  //               Size: "XL",
  //             },
  //             prices: [
  //               {
  //                 amount: 10,
  //                 currency_code: "eur",
  //               },
  //               {
  //                 amount: 15,
  //                 currency_code: "usd",
  //               },
  //             ],
  //           },
  //         ],
  //         sales_channels: [
  //           {
  //             id: defaultSalesChannel[0].id,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
