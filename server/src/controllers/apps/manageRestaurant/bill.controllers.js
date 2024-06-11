import { Restaurant } from "../../../models/apps/auth/restaurant.models.js";
import { Customer } from "../../../models/apps/manageRestaurant/customer.models.js";
import { Order } from "../../../models/apps/manageRestaurant/order.models.js";
import { Menu } from "../../../models/apps/manageRestaurant/menu.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Tax } from "../../../models/apps/manageRestaurant/tax.models.js";
import { ENUMS } from "../constants/enum.js";

// Helper function to get tax rate by name
const getTaxRateByName = (taxes, taxName) => {
  const tax = taxes.find((t) => t.taxName === taxName);
  return tax ? tax.taxPercentage / 100 : 0;
};

// Controller to generate a customer bill
const generateCustomerBill = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const customer = await Customer.findById(req.customer?._id);
  if (!customer) {
    throw new ApiError(401, "Customer not found");
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(401, "Restaurant not found");
  }

  // Fetch taxes for the restaurant
  const taxes = await Tax.find({ restaurantId: restaurant._id });

  // Fetch tax rates
  const serviceChargeRate = getTaxRateByName(taxes, "Service charge");
  const vatAlcoholRate = getTaxRateByName(taxes, "VAT Alcoholic");
  const vatFoodRate = getTaxRateByName(taxes, "VAT Non-Alcoholic");
  const serviceTaxRate = getTaxRateByName(taxes, "Service tax");

  // Define the time range for the last 12 hours
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

  // Define the aggregation pipeline stages
  const pipeline = [
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        customerId: new mongoose.Types.ObjectId(customer._id),
        createdAt: { $gte: twelveHoursAgo },
        status: { $in: ["Ready", "Served"] },
      },
    },
    {
      $lookup: {
        from: "menus", // Assuming "menus" is the name of your menus collection
        let: { items: "$items.menuItemId" },
        pipeline: [
          {
            $unwind: "$categories",
          },
          {
            $unwind: "$categories.items",
          },
          {
            $match: {
              $expr: {
                $in: ["$categories.items._id", "$$items"],
              },
            },
          },
          {
            $project: {
              _id: "$categories.items._id",
              title: "$categories.items.title",
              description: "$categories.items.description",
              image: "$categories.items.image",
              itemType: "$categories.items.itemType", // Include itemType for tax categorization
            },
          },
        ],
        as: "menuItems",
      },
    },
    {
      $addFields: {
        items: {
          $map: {
            input: "$items",
            as: "origItem",
            in: {
              $mergeObjects: [
                "$$origItem",
                {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$menuItems",
                        cond: { $eq: ["$$this._id", "$$origItem.menuItemId"] },
                      },
                    },
                    0,
                  ],
                },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        menuItems: 0, // Remove the temporary field 'menuItems' after merging
      },
    },
  ];

  const orders = await Order.aggregate(pipeline);

  if (!orders || orders.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "No orders found for this customer"));
  }

  // Calculate the total amount for alcoholic beverages and food & non-alcoholic beverages
  let alcoholicBeveragesTotal = 0;
  let foodAndNonAlcoholicTotal = 0;

  for (const order of orders) {
    for (const item of order.items) {
      console.log("item ==>", item);
      const itemTotal = item.quantity * item.itemPrice;
      const itemType = item.itemType;

      if (itemType) {
        if (itemType === ENUMS.menuItemType[1]) {
          alcoholicBeveragesTotal += itemTotal;
        } else {
          foodAndNonAlcoholicTotal += itemTotal;
        }
      } else {
        console.warn(
          `Item "${item.title}" not found in menu, skipping tax categorization.`
        );
      }
    }
  }

  const grossTotal = alcoholicBeveragesTotal + foodAndNonAlcoholicTotal;
  const serviceCharge = grossTotal * serviceChargeRate;
  const vatAlcohol = alcoholicBeveragesTotal * vatAlcoholRate;
  const vatFood = foodAndNonAlcoholicTotal * vatFoodRate;
  const serviceTax = (grossTotal + serviceCharge) * serviceTaxRate;
  const netAmount =
    grossTotal + serviceCharge + vatAlcohol + vatFood + serviceTax;

  // Construct the bill
  const bill = {
    customer: customer.name,
    restaurant: restaurant.name,
    items: orders.map((order) => order.items).flat(),
    grossTotal: grossTotal.toFixed(2),
    serviceCharge: serviceCharge.toFixed(2),
    vatAlcohol: vatAlcohol.toFixed(2),
    vatFood: vatFood.toFixed(2),
    serviceTax: serviceTax.toFixed(2),
    netAmount: netAmount.toFixed(2),
  };

  // Return the bill as a successful response
  res
    .status(200)
    .json(new ApiResponse(200, bill, "Bill generated successfully"));
});

export { generateCustomerBill };
