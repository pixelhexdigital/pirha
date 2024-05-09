import { Order } from "../../../models/apps/manageRestaurant/order.models.js";
import { Customer } from "../../../models/apps/manageRestaurant/customer.models.js";
import { Restaurant } from "../../../models/apps/auth/restaurant.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { Menu } from "../../../models/apps/manageRestaurant/menu.models.js";
import mongoose from "mongoose";

// Helper function to calculate total amount based on order items
const calculateTotalAmount = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Controller to create a new order for a customer
const createOrder = asyncHandler(async (req, res) => {
  const { restaurantId, items } = req.body;
  const customer = await Customer.findById(req.customer._id);
  if (!customer) {
    throw new ApiError(401, "Customer not found");
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(401, "Restaurant not found");
  }

  // Prepare array to store processed items with prices
  const processedItems = [];

  // Iterate through each item in the request body
  for (const item of items) {
    const { menuItemId, quantity } = item;

    // Find the menu containing the item by menuId
    const menu = await Menu.findOne({ "categories.items._id": menuItemId });
    if (!menu) {
      throw new ApiError(404, `Menu with item ID ${menuItemId} not found`);
    }

    // Find the specific item within the menu's categories
    let menuItem = null;
    for (const category of menu.categories) {
      menuItem = category.items.find((item) => item._id.equals(menuItemId));
      if (menuItem) {
        break;
      }
    }

    if (!menuItem) {
      throw new ApiError(404, `Menu item with ID ${menuItemId} not found`);
    }
    const itemPrice = menuItem.price;

    // Construct processed item object with item details and calculated price
    const processedItem = {
      menuItemId,
      quantity,
      itemPrice,
    };

    // Push processed item into the array
    processedItems.push(processedItem);
  }

  // Create the order with processed items
  const newOrder = await Order.create({
    restaurantId: restaurant._id,
    customerId: customer._id,
    items: processedItems,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, { order: newOrder }, "Order created successfully")
    );
});

// Controller to get orders for a specific customer
const getOrderByCustomer = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const customer = req.customer._id;
  if (!customer) {
    throw new ApiError(401, "Customer not found");
  }

  // Define the aggregation pipeline stages
  const pipeline = [
    {
      $match: {
        customerId: new mongoose.Types.ObjectId(req.customer._id),
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

  const orders = await Order.aggregate(pipeline);

  // If no orders found, return a 404 response
  if (!orders || orders.totalOrders === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "No orders found for this customer"));
  }

  // Return the paginated orders as a successful response
  res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

// Export all controllers
export { createOrder, getOrderByCustomer };
