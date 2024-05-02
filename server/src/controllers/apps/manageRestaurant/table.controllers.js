import { Restaurant } from "../../../models/apps/auth/restaurant.models.js";
import { Table } from "../../../models/apps/manageRestaurant/table.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

// Get list of tables for a restaurant
const fetchTables = asyncHandler(async (req, res) => {
  const tables = await Table.find();

  res.json(
    new ApiResponse(200, { tables }, "list of table fetched from database")
  );
});

// Register tables for a restaurant
const registerTables = asyncHandler(async (req, res) => {
  const { letter, tables } = req.body;
  const tablePromises = [];

  // Check if tables is a valid number
  if (isNaN(tables)) {
    throw new ApiError(401, "tables should be a number");
  }

  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }

  if (!restaurant.baseURL) {
    throw new ApiError(404, "Please update baseURL of restaurant");
  }

  for (let i = 1; i <= tables; i++) {
    const tableNumber = `${letter}-${i}`;

    const newTable = new Table({
      title: tableNumber,
      restaurantId: restaurant._id,
      baseUrl: restaurant.baseURL,
    });

    tablePromises.push(newTable.save());
  }

  await Promise.all(tablePromises);

  res
    .status(201)
    .json(new ApiResponse(200, {}, "Tables registered successfully"));
});

// Delete a specific table by ID
const deleteTableById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Table.findByIdAndDelete(id);

  res.json(new ApiResponse(200, {}, "Table deleted successfully"));
});

// Batch delete tables by array of IDs
const deleteTablesByIds = asyncHandler(async (req, res) => {
  const { tableIds } = req.body;
  await Table.deleteMany({ _id: { $in: tableIds } });

  res.json(new ApiResponse(200, {}, "Tables deleted successfully"));
});

// Edit a specific table by ID
const updateTableById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedTable = await Table.findByIdAndUpdate(id, updates, {
    new: true,
  });

  res.json(
    new ApiResponse(200, { table: updatedTable }, "Table updated successfully")
  );
});

// Batch edit tables by array of objects containing ID and updates
const updateTables = asyncHandler(async (req, res) => {
  const { tableUpdates } = req.body;
  const updatePromises = tableUpdates.map(async (update) => {
    const { id, ...updates } = update;
    const updatedTable = await Table.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return updatedTable;
  });

  const updatedTables = await Promise.all(updatePromises);

  res.json(
    new ApiResponse(
      200,
      { tables: updatedTables },
      "Tables updated successfully"
    )
  );
});

export {
  fetchTables,
  registerTables,
  deleteTableById,
  deleteTablesByIds,
  updateTableById,
  updateTables,
};
