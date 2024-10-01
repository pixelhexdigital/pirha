import { Restaurant } from "../../../models/apps/auth/restaurant.models.js";
import { Customer } from "../../../models/apps/manageRestaurant/customer.models.js";
import { Order } from "../../../models/apps/manageRestaurant/order.models.js";
import { Menu } from "../../../models/apps/manageRestaurant/menu.models.js";
import { Table } from "../../../models/apps/manageRestaurant/table.models.js";
import { Bill } from "../../../models/apps/manageRestaurant/bill.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Tax } from "../../../models/apps/manageRestaurant/tax.models.js";
import { ENUMS } from "../../../constants/enum.js";
import { OrderEventEnum } from "../../../constants.js";

// Helper function to get tax rate by name
const getTaxRateByName = (taxes, taxName) => {
  const tax = taxes.find((t) => t.taxName === taxName);
  return tax ? tax.taxPercentage / 100 : 0;
};

// Helper function to fetch taxes for a restaurant
const fetchTaxes = async (restaurantId) => {
  return Tax.find({ restaurantId });
};

// Helper function to fetch customer and restaurant
const fetchCustomerAndRestaurant = async (
  restaurantId,
  customerId,
  tempCustomerId,
  tempRestaurantId
) => {
  let customer, restaurant;
  if (restaurantId) {
    customer = await Customer.findById(tempCustomerId);
    restaurant = await Restaurant.findById(restaurantId);
  } else {
    customer = await Customer.findById(customerId);
    restaurant = await Restaurant.findById(tempRestaurantId);
  }
  if (!customer) throw new ApiError(401, "Customer not found");
  if (!restaurant) throw new ApiError(401, "Restaurant not found");
  return { customer, restaurant };
};

// Helper function to define the aggregation pipeline
const definePipeline = (restaurantId, entityId, entityKey) => {
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  return [
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        [entityKey]: new mongoose.Types.ObjectId(entityId),
        createdAt: { $gte: twelveHoursAgo },
        status: { $in: ["Ready", "Served"] },
      },
    },
    {
      $lookup: {
        from: "menus",
        let: { items: "$items.menuItemId" },
        pipeline: [
          { $unwind: "$categories" },
          { $unwind: "$categories.items" },
          { $match: { $expr: { $in: ["$categories.items._id", "$$items"] } } },
          {
            $project: {
              _id: "$categories.items._id",
              title: "$categories.items.title",
              description: "$categories.items.description",
              image: "$categories.items.image",
              itemType: "$categories.items.itemType",
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
    { $project: { menuItems: 0 } },
  ];
};

// Helper function to calculate totals and create a new Bill entry
const createBill = async (restaurant, orders, taxes) => {
  let alcoholicBeveragesTotal = 0;
  let foodAndNonAlcoholicTotal = 0;
  let tableId;

  for (const order of orders) {
    if (!tableId && order.tableId) {
      tableId = order.tableId;
    }
    for (const item of order.items) {
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
  const serviceChargeRate = getTaxRateByName(taxes, "Service charge");
  const vatAlcoholRate = getTaxRateByName(taxes, "VAT Alcoholic");
  const vatFoodRate = getTaxRateByName(taxes, "VAT Non-Alcoholic");
  const serviceTaxRate = getTaxRateByName(taxes, "Service tax");

  const serviceCharge = grossTotal * serviceChargeRate;
  const vatAlcohol = alcoholicBeveragesTotal * vatAlcoholRate;
  const vatFood = foodAndNonAlcoholicTotal * vatFoodRate;
  const serviceTax = (grossTotal + serviceCharge) * serviceTaxRate;
  const netAmount =
    grossTotal + serviceCharge + vatAlcohol + vatFood + serviceTax;

  const newBill = new Bill({
    restaurantId: restaurant._id,
    tableId,
    customers: orders.map((order) => order.customerId),
    orders: orders.map((order) => order._id),
    grossTotal: grossTotal.toFixed(2),
    serviceCharge: serviceCharge.toFixed(2),
    vatAlcohol: vatAlcohol.toFixed(2),
    vatFood: vatFood.toFixed(2),
    serviceTax: serviceTax.toFixed(2),
    netAmount: netAmount.toFixed(2),
    paymentStatus: ENUMS.paymentStatus[0],
    paymentMethod: ENUMS.paymentMethod[0],
  });

  await newBill.save();

  const orderIds = orders.map((order) => order._id);
  await Order.updateMany(
    { _id: { $in: orderIds } },
    { $set: { status: ENUMS.orderStatus[4] } }
  );

  orderIds.forEach((orderId) => {
    emitSocketEvent(
      req,
      orderId.toString(),
      OrderEventEnum.UPDATE_ORDER_STATUS_EVENT,
      {
        orderId: orderId.toString(),
        status: ENUMS.orderStatus[4],
      }
    );
  });

  if (tableId) {
    emitSocketEvent(
      req,
      tableId.toString(),
      OrderEventEnum.UPDATE_ORDER_STATUS_EVENT,
      {
        tableId: tableId.toString(),
        status: ENUMS.tableStatus[0],
      }
    );
  }

  return newBill;
};

// Controller to generate a customer bill
const generateCustomerBill = asyncHandler(async (req, res) => {
  const { restaurantId, customerId } = req.params;
  let tempCustomerId = req.customer?._id;
  let tempRestaurantId = req.restaurant?._id;

  if (!restaurantId && !customerId) {
    throw new ApiError(405, "Please provide needed params");
  }

  const { customer, restaurant } = await fetchCustomerAndRestaurant(
    restaurantId,
    customerId,
    tempCustomerId,
    tempRestaurantId
  );
  const taxes = await fetchTaxes(restaurant._id);

  const pipeline = definePipeline(restaurant._id, customer._id, "customerId");
  const orders = await Order.aggregate(pipeline);

  if (!orders || orders.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "No orders found for this customer"));
  }

  const newBill = await createBill(restaurant, orders, taxes);

  const billResponse = {
    customer: customer.name,
    restaurant: restaurant.name,
    items: orders.map((order) => order.items).flat(),
    grossTotal: newBill.grossTotal,
    serviceCharge: newBill.serviceCharge,
    vatAlcohol: newBill.vatAlcohol,
    vatFood: newBill.vatFood,
    serviceTax: newBill.serviceTax,
    netAmount: newBill.netAmount,
  };

  res
    .status(200)
    .json(new ApiResponse(200, billResponse, "Bill generated successfully"));
});

// Controller to generate a bill for a table
const generateBillForTable = asyncHandler(async (req, res) => {
  const { tableId } = req.params;
  let tempCustomerId = req.customer?._id;

  if (!tableId) {
    throw new ApiError(405, "Please provide needed params");
  }
  const table = await Table.findById(tableId);
  if (!table) throw new ApiError(401, "Table not found");

  const customer = await Customer.findById(tempCustomerId);
  if (!customer) throw new ApiError(401, "Customer not found");

  const restaurant = await Restaurant.findById(table.restaurantId);
  if (!restaurant) throw new ApiError(401, "Restaurant not found");

  const taxes = await fetchTaxes(restaurant._id);
  const pipeline = definePipeline(restaurant._id, table._id, "tableId");
  const orders = await Order.aggregate(pipeline);

  if (!orders || orders.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "No orders found for this table"));
  }

  const newBill = await createBill(restaurant, orders, taxes);

  const billResponse = {
    table: table.name,
    customer: customer.firstName,
    restaurant: restaurant.name,
    items: orders.map((order) => order.items).flat(),
    grossTotal: newBill.grossTotal,
    serviceCharge: newBill.serviceCharge,
    vatAlcohol: newBill.vatAlcohol,
    vatFood: newBill.vatFood,
    serviceTax: newBill.serviceTax,
    netAmount: newBill.netAmount,
  };

  res
    .status(200)
    .json(new ApiResponse(200, billResponse, "Bill generated successfully"));
});

export { generateCustomerBill, generateBillForTable };
