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

  for (const table of tables) {
    const qrCodeText = `${baseURL}?tableId=${table._id}&restaurantId=${restaurant._id}`;
    const canvas = createCanvas(512, 728);
    const ctx = canvas.getContext("2d");

    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 512, 728);
    gradient.addColorStop(0, "#1E3A8A"); // Dark blue
    gradient.addColorStop(1, "#2563EB"); // Lighter blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 728);

    // Add accent shapes
    ctx.fillStyle = "#EC4899";
    ctx.beginPath();
    ctx.arc(60, 60, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(480, 700, 60, 0, Math.PI * 2);
    ctx.fill();

    // Generate QR Code
    const qrCanvas = createCanvas(200, 200);
    await QRCode.toCanvas(qrCanvas, qrCodeText, {
      color: {
        dark: "#000",
        light: "#fff",
      },
      width: 180,
      margin: 5,
      errorCorrectionLevel: "H",
      scale: 10,
    });

    // Draw QR Code inside a rounded white card
    ctx.fillStyle = "#fff";
    ctx.roundRect(106, 200, 300, 300, 25);
    ctx.fill();
    ctx.drawImage(qrCanvas, 116, 210, 280, 280);

    // Restaurant logo
    if (restaurant.avatar.url) {
      try {
        const avatarImage = await loadImage(restaurant.avatar.url);
        ctx.save();
        ctx.beginPath();
        ctx.arc(65, 65, 35, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImage, 30, 30, 70, 70);
        ctx.restore();
      } catch (error) {
        console.error(`Failed to load avatar image: ${error.message}`);
      }
    }

    // Restaurant Name
    ctx.font = "bold 28px Poppins";
    ctx.fillStyle = "#fff";
    ctx.fillText(restaurant.restroName, 120, 75);

    // Table Title
    ctx.font = "bold 40px Poppins";
    ctx.textAlign = "center";
    ctx.fillText(`${table.title.toUpperCase()}`, 256, 550);

    // Subtitle
    ctx.font = "22px Poppins";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText("Scan to view our menu", 256, 590);

    // Convert to buffer
    const buffer = canvas.toBuffer("image/png");
    zip.file(`${table.title}.png`, buffer);
  }

  // Generate ZIP file
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
