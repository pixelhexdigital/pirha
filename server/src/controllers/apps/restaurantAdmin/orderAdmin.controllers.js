import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { Order } from "../../../models/apps/manageRestaurant/order.models.js";
import { emitSocketEvent } from "../../../socket/index.js";
import { OrderEventEnum } from "../../../constants.js";
import { Restaurant } from "../../../models/apps/auth/restaurant.models.js";
import mongoose from "mongoose";

const updateOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, paymentStatus, paymentMethod } = req.body;
  const restaurantId = req.restaurant?._id;
  const order = await Order.findById(orderId);
  if (!order.restaurantId.equals(restaurantId)) {
    console.log("order.restaurantId ===>", order.restaurantId);
    console.log("restaurantId ===>", restaurantId);
    throw new ApiError(401, "Unauthorised");
  }

  let updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        status,
        paymentStatus,
        paymentMethod,
      },
    },
    { new: true }
  );

  emitSocketEvent(
    req,
    restaurantId.toString(),
    OrderEventEnum.UPDATE_ORDER_STATUS_EVENT,
    updateOrder
  );

  //   profile = await getUserSocialProfile(req.restaurant._id, req);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedOrder, "Order details updated successfully")
    );
});

const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const restaurantId = req.restaurant?._id;
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // Define the aggregation pipeline stages
  const pipeline = [
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(req.restaurant._id),
        ...(status && { status }), // Add the status filter if provided
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
              itemType: "$categories.items.itemType",
            },
          },
        ],
        as: "menuItems",
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customer",
      },
    },
    {
      $unwind: "$customer", // Unwind the customer array to include customer details directly in the document
    },
    {
      $lookup: {
        from: "tables",
        localField: "tableId",
        foreignField: "_id",
        as: "table",
      },
    },
    {
      $unwind: "$table", // Unwind the table array to include table details directly in the document
    },
    {
      $addFields: {
        items: {
          $map: {
            input: "$items",
            as: "origItem",
            in: {
              $mergeObjects: [
                {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$menuItems",
                        cond: { $eq: ["$$origItem.menuItemId", "$$this._id"] },
                      },
                    },
                    0,
                  ],
                },
                "$$origItem",
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        customer: {
          firstName: "$customer.firstName",
          lastName: "$customer.lastName",
          number: "$customer.number",
        },
        table: "$table.title",
        restaurantId: 1,
        customerId: 1,
        tableId: 1,
        items: 1,
        totalAmount: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];
  const orderAggregation = Order.aggregate(pipeline);

  const orders = await Order.aggregatePaginate(orderAggregation, {
    page,
    limit,
    customLabels: {
      totalDocs: "totalOrders",
      docs: "orders",
    },
  });

  // If no orders found, return a 404 response
  if (!orders || orders.totalOrders === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "No orders found for this restaurant"));
  }

  // Return the paginated orders as a successful response
  res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

export { getOrders, updateOrder };
