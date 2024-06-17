import { Restaurant } from "../../../models/apps/auth/restaurant.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import mongoose from "mongoose";

// Controller to get the dashboard details for a specific restaurant
const getDashboard = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;

  if (!restaurantId) {
    throw new ApiError(401, "Restaurant not found");
  }

  // Define the aggregation pipeline stages
  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(restaurantId),
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "restaurantId",
        as: "orders",
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customers",
        foreignField: "_id",
        as: "customers",
      },
    },
    {
      $lookup: {
        from: "menus",
        localField: "_id",
        foreignField: "restaurantId",
        as: "menus",
      },
    },
    {
      $lookup: {
        from: "taxes",
        localField: "_id",
        foreignField: "restaurantId",
        as: "taxes",
      },
    },
    {
      $project: {
        restroName: 1,
        location: 1,
        ownerFullName: 1,
        yearOfEstablishment: 1,
        socialLink: 1,
        avatar: 1,
        coverImage: 1,
        totalOrders: { $size: "$orders" },
        totalCustomers: { $size: "$customers" },
        totalMenus: { $size: "$menus" },
        taxes: {
          $map: {
            input: "$taxes",
            as: "tax",
            in: {
              taxName: "$$tax.taxName",
              taxPercentage: "$$tax.taxPercentage",
            },
          },
        },
      },
    },
  ];

  const dashboardDetails = await Restaurant.aggregate(pipeline);

  // If no dashboard details found, return a 404 response
  if (!dashboardDetails || dashboardDetails.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Dashboard details not found"));
  }

  // Return the dashboard details as a successful response
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        dashboardDetails[0],
        "Dashboard details fetched successfully"
      )
    );
});

export { getDashboard };
