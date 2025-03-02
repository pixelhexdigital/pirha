import { Restaurant } from "../../../models/apps/auth/restaurant.models.js";
import { Table } from "../../../models/apps/manageRestaurant/table.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import QRCode from "qrcode";
import JSZip from "jszip";
import fs from "fs";
import { promisify } from "util";
import { Image, createCanvas, loadImage } from "canvas";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { ENUMS } from "../../../constants/enum.js";

// Get list of tables for a restaurant
const fetchTables = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }

  // Define the aggregation pipeline stages
  const pipeline = [
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(req.restaurant._id),
      },
    },
  ];

  const tableAggregation = Table.aggregate(pipeline);

  const tables = await Table.aggregatePaginate(tableAggregation, {
    page,
    limit,
    customLabels: {
      totalDocs: "totalTables",
      docs: "tables",
    },
  });

  // If no tables found, return a 404 response
  if (!tables || tables.totalTables === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "No tables found for this restaurant"));
  }

  // Return the paginated tables as a successful response
  res
    .status(200)
    .json(new ApiResponse(200, tables, "Tables retrieved successfully"));
});

// Determine the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateQRCode = async (tables, restaurant, baseURL) => {
  const zip = new JSZip();
  const templatePath = path.join(
    __dirname,
    "../../../assets/qr_generator_template.png"
  );
  console.log("Template Path: ", templatePath); // Debugging line to verify path

  let templateImage;
  try {
    templateImage = await loadImage(templatePath);
  } catch (error) {
    throw new ApiError(500, `Failed to load template image: ${error.message}`);
  }

  // Load the restaurant's avatar image
  let avatarImage;
  if (restaurant.avatar.url) {
    try {
      avatarImage = await loadImage(restaurant.avatar.url);
    } catch (error) {
      console.error(`Failed to load avatar image: ${error.message}`);
    }
  }

  for (const table of tables) {
    const qrCodeText = `${baseURL}?tableId=${table._id}&restaurantId=${restaurant._id}`;

    // Create a new canvas to draw QR code
    const canvas = createCanvas(512, 728);
    const ctx = canvas.getContext("2d");

    // Draw the template image onto the canvas
    ctx.drawImage(templateImage, 0, 0, 512, 728);

    // Generate QR code on a separate canvas and draw it onto the main canvas
    const qrCanvas = createCanvas(200, 200);
    await QRCode.toCanvas(qrCanvas, qrCodeText, {
      color: {
        dark: "#080b53", // dark blue color for QR code lines
      },
      width: 180,
      margin: 5,
      errorCorrectionLevel: "H",
      scale: 10,
    });

    ctx.drawImage(qrCanvas, 106, 150, 300, 300); // Adjust positions as needed

    // Add table title
    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(table.title.toUpperCase(), 256, 494); // Adjust positions as needed

    // Add restaurant name
    ctx.fillText(restaurant.restroName, 240, 590); // Adjust positions as needed

    // Add restaurant avatar
    if (avatarImage) {
      ctx.drawImage(avatarImage, 50, 550, 80, 80); // Adjust positions as needed
    }

    // Convert canvas to buffer (PNG image)
    const buffer = canvas.toBuffer("image/png");

    // Add QR code image to ZIP file with table title as filename
    zip.file(`${table.title}.png`, buffer);
  }

  // Generate ZIP file containing all QR code images
  const zipData = await zip.generateAsync({ type: "nodebuffer" });
  return zipData;
};

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
      $in: Array.from(
        { length: endNumber },
        (_, i) => `${startLetter}-${i + 1}`
      ),
    },
  }).sort({ title: 1 });

  if (tables.length === 0) {
    throw new ApiError(404, "No tables found within the specified range");
  }

  const zipData = await generateQRCode(tables, restaurant, baseURL);

  // Set response headers and send the ZIP file as a response
  res.set("Content-Type", "application/zip");
  res.set("Content-Disposition", "attachment; filename=table_qr_codes.zip");
  res.send(zipData);
});

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

  const bulkOperations = [];

  const newTables = [];

  for (let i = 1; i <= tables; i++) {
    const nextTableNumber = `${letter}-${highestNumber + i}`;

    const newTableDocument = {
      insertOne: {
        document: {
          title: nextTableNumber,
          restaurantId: restaurant._id,
          baseUrl: restaurant.baseURL,
        },
      },
    };

    bulkOperations.push(newTableDocument);
    newTables.push(newTableDocument.insertOne.document);
  }

  await Table.bulkWrite(bulkOperations);
  const onboardingState = ENUMS.onboardingState[2];

  // Restaurant.findByIdAndUpdate(restaurant._id, { onboardingState });
  await restaurant.updateOne({ onboardingState });

  const zipData = await generateQRCode(
    newTables,
    restaurant,
    restaurant.baseURL
  );

  // Set response headers and send the ZIP file as a response
  res.set("Content-Type", "application/zip");
  res.set(
    "Content-Disposition",
    "attachment; filename=registered_table_qr_codes.zip"
  );
  res.send(zipData);
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
