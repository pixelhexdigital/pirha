import { Restaurant } from "../../../models/apps/auth/restaurant.models.js";
import { Table } from "../../../models/apps/manageRestaurant/table.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import QRCode from "qrcode";
import JSZip from "jszip";
import fs from "fs";
import { promisify } from "util";
import { createCanvas, loadImage } from "canvas";

// Get list of tables for a restaurant
const fetchTables = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }

  // Retrieve tables belonging to the current restaurant
  const tables = await Table.find({ restaurantId: restaurant._id });

  res.json(
    new ApiResponse(200, { tables }, "List of tables fetched from the database")
  );
});

const downloadTableQr = asyncHandler(async (req, res) => {
  const { startTable, endTable } = req.body;

  // Validate startTable and endTable
  const [startLetter, startNumber] = startTable.split("-");
  const [endLetter, endNumber] = endTable.split("-");

  if (startLetter !== endLetter || isNaN(startNumber) || isNaN(endNumber)) {
    throw new ApiError(400, "Invalid startTable or endTable format");
  }

  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }

  let baseURL = restaurant.baseURL || "";

  // Remove trailing '/' from baseURL if present at the end
  if (baseURL.endsWith("/")) {
    baseURL = baseURL.slice(0, -1); // Remove the last character (which is '/')
  }

  if (!baseURL) {
    throw new ApiError(404, "Please update baseURL of restaurant");
  }

  const restaurantId = restaurant._id;

  // Find tables within the specified range and belonging to the restaurant
  const tables = await Table.find({
    restaurantId,
    title: {
      $gte: startTable,
      $lte: endTable,
    },
  });

  if (tables.length === 0) {
    throw new ApiError(404, "No tables found within the specified range");
  }

  const zip = new JSZip();

  // Iterate over the tables and generate QR codes
  for (const table of tables) {
    const qrCodeText = `${baseURL}?tableId=${table._id}`;

    // Create a new canvas to draw QR code
    const canvas = createCanvas(300, 300);
    const ctx = canvas.getContext("2d");

    // Generate QR code and draw on canvas
    await QRCode.toCanvas(canvas, qrCodeText);

    // Convert canvas to buffer (PNG image)
    const buffer = canvas.toBuffer("image/png");

    // Add QR code image to ZIP file with table title as filename
    zip.file(`${table.title}.png`, buffer);
  }

  // Generate ZIP file containing all QR code images
  const zipData = await zip.generateAsync({ type: "nodebuffer" });

  // Set response headers and send the ZIP file as a response
  res.set("Content-Type", "application/zip");
  res.set("Content-Disposition", "attachment; filename=table_qr_codes.zip");
  res.send(zipData);
});

// Register tables for a restaurant

const registerTables = asyncHandler(async (req, res) => {
  const { letter, tables } = req.body;

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

  // Find the highest existing table number for the specified letter prefix
  const existingTables = await Table.find({
    restaurantId: restaurant._id,
    title: { $regex: `^${letter}-\\d+$` }, // Match titles starting with the specified letter
  })
    .sort({ title: -1 })
    .limit(1); // Sort descending and limit to one record

  let highestNumber = 0;
  if (existingTables.length > 0) {
    const lastTableTitle = existingTables[0].title;
    const lastNumber = parseInt(lastTableTitle.split("-")[1], 10);
    highestNumber = lastNumber;
  }

  const tablePromises = [];

  for (let i = 1; i <= tables; i++) {
    const nextTableNumber = `${letter}-${highestNumber + i}`;

    const newTable = new Table({
      title: nextTableNumber,
      restaurantId: restaurant._id,
      baseUrl: restaurant.baseURL,
    });

    tablePromises.push(newTable.save());
  }

  await Promise.all(tablePromises);

  res.json(new ApiResponse(201, {}, "Tables created successfully"));
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
  downloadTableQr,
};
