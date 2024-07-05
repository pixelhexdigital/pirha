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
  const { page = 1, limit = 10 } = req.query;
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
        menuItems: 0, // Remove the temporary field 'menuItems' after merging
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
