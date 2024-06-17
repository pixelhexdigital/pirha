import { Restaurant } from "../../../models/apps/auth/restaurant.models.js";
import { Tax } from "../../../models/apps/manageRestaurant/tax.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

// Get list of taxes for a restaurant
const fetchTaxes = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }

  // Retrieve taxes belonging to the current restaurant
  const taxes = await Tax.find({ restaurantId: restaurant._id });

  res.json(
    new ApiResponse(200, { taxes }, "List of taxes fetched from the database")
  );
});

// Register taxes for a restaurant
const registerTax = asyncHandler(async (req, res) => {
  const { taxName, taxPercentage } = req.body;

  // Validate taxPercentage
  if (isNaN(taxPercentage) || taxPercentage < 0 || taxPercentage > 100) {
    throw new ApiError(400, "Invalid taxPercentage value");
  }

  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }

  const existingTax = await Tax.findOne({ taxName });

  if (existingTax) {
    throw new ApiError(401, "Taxname already exist for the restaurant");
  }

  const newTax = new Tax({
    taxName,
    taxPercentage,
    restaurantId: restaurant._id,
  });

  await newTax.save();

  res.json(new ApiResponse(201, { tax: newTax }, "Tax created successfully"));
});

// Delete a specific tax by ID
const deleteTaxById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Tax.findByIdAndDelete(id);

  res.json(new ApiResponse(200, {}, "Tax deleted successfully"));
});

// Edit a specific tax by ID
const updateTaxById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedTax = await Tax.findByIdAndUpdate(id, updates, {
    new: true,
  });

  res.json(
    new ApiResponse(200, { tax: updatedTax }, "Tax updated successfully")
  );
});

export { fetchTaxes, registerTax, deleteTaxById, updateTaxById };
