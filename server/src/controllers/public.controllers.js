import { Restaurant } from "../models/apps/auth/restaurant.models.js";
import { Table } from "../models/apps/manageRestaurant/table.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ENUMS } from "./apps/constants/enum.js";

const fetchEnum = asyncHandler(async (req, res) => {
  const enums = ENUMS;
  return res
    .status(200)
    .json(new ApiResponse(200, { enums }, "Enums fetched Succesfully"));
});

const getRestaurantById = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const restaurant = await Restaurant.findById(restaurantId).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -role -loginType -isEmailVerified -customers -taxes"
  );
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { restaurant },
        "Restaurant details fetched succesfully"
      )
    );
});
const getTableById = asyncHandler(async (req, res) => {
  const { tableId } = req.params;
  const table = await Table.findById(tableId);
  if (!table) {
    throw new ApiError(404, "Table not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { table }, "Table details fetched succesfully"));
});

export { fetchEnum, getRestaurantById, getTableById };
