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

  for (const table of tables) {
    const table = tables[0]; // Get the first table from the tables array
    const qrCodeText = `${baseURL}?tableId=${table._id}&restaurantId=${restaurant._id}`; // Generate the QR code text with the base URL, table ID, and restaurant ID
    const canvas = createCanvas(512, 728); // Create a canvas with the specified dimensions
    const ctx = canvas.getContext("2d"); // Get the 2D rendering context of the canvas

    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 512, 728); // Create a linear gradient for the background
    gradient.addColorStop(0, "#1E3A8A"); // Set the first color stop of the gradient to dark blue
    gradient.addColorStop(1, "#2563EB"); // Set the second color stop of the gradient to lighter blue
    ctx.fillStyle = gradient; // Set the fill style of the context to the gradient
    ctx.fillRect(0, 0, 512, 728); // Fill the entire canvas with the gradient

    // Add accent shapes
    ctx.fillStyle = "#EC4899"; // Set the fill style of the context to a specific color
    ctx.beginPath(); // Start a new path
    ctx.arc(480, 30, 150, 0, Math.PI * 3.5); // Add an arc shape to the path
    ctx.fill(); // Fill the path with the current fill style
    ctx.beginPath(); // Start a new path
    ctx.arc(20, 680, 150, 0, Math.PI * 3.5); // Add an arc shape to the path
    ctx.fill(); // Fill the path with the current fill style/
    ctx.beginPath(); // Start a new path

    // Generate QR Code
    const qrCanvas = createCanvas(200, 200); // Create a canvas for the QR code
    await QRCode.toCanvas(qrCanvas, qrCodeText, {
      // Generate the QR code and draw it on the QR canvas
      color: { dark: "#000", light: "#fff" }, // Set the color options for the QR code
      width: 180, // Set the width of the QR code
      margin: 5, // Set the margin of the QR code
      errorCorrectionLevel: "H", // Set the error correction level of the QR code
      scale: 10, // Set the scale of the QR code
    });

    // Draw QR Code inside a rounded white card
    ctx.fillStyle = "#fff"; // Set the fill style of the context to white
    ctx.roundRect(106, 200, 300, 300, 25); // Draw a rounded rectangle on the canvas
    ctx.fill(); // Fill the rounded rectangle with the current fill style
    ctx.drawImage(qrCanvas, 116, 210, 280, 280); // Draw the QR code on the canvas

    // Restaurant logo
    if (restaurant.avatar.url) {
      // Check if the restaurant has an avatar URL
      try {
        const avatarImage = await loadImage(restaurant.avatar.url); // Load the avatar image
        ctx.save(); // Save the current context state
        ctx.beginPath(); // Start a new path
        ctx.arc(80, 145, 35, 0, Math.PI * 2); // Add an arc shape to the path
        ctx.clip(); // Clip the context to the current path
        ctx.fill(); // Fill the path with the current fill style
        ctx.drawImage(avatarImage, 45, 110, 70, 70); // Draw the avatar image on the canvas
        ctx.restore(); // Restore the saved context state
      } catch (error) {
        console.error(`Failed to load avatar image: ${error.message}`); // Log an error message if the avatar image fails to load
      }
    }

    // Restaurant Name
    ctx.font = "bold 32px Poppins"; // Set the font style of the context
    ctx.fillStyle = "#fff"; // Set the fill style of the context to white
    ctx.textAlign = "left"; // Set the text alignment of the context to left
    const restaurantName = restaurant.restroName; // Get the restaurant name
    const maxLineWidth = 370; // Maximum width for the text
    const lineHeight = 32; // Line height for the text
    const lines = [];
    let line = "";
    const words = restaurantName.split(" ");

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxLineWidth && i > 0) {
        lines.push(line);
        line = words[i] ? words[i] + " " : "";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    const x = 125; // X position for the text
    let y = 140; // Y position for the text
    const limit = lines.length > 2 ? 2 : lines.length;
    if (limit === 1) {
      y += 16;
    }
    for (let i = 0; i < limit; i++) {
      const lineY = y + i * lineHeight;
      ctx.fillText(lines[i], x, lineY); // Draw each line of the restaurant name on the canvas
    }

    // Table Title
    ctx.font = "bold 40px Poppins"; // Set the font style of the context
    ctx.textAlign = "center"; // Set the text alignment of the context to center
    ctx.fillText(`${table.title.toUpperCase()}`, 256, 550); // Draw the table title on the canvas

    // Subtitle
    ctx.font = "22px Poppins"; // Set the font style of the context
    ctx.fillStyle = "#e5e7eb"; // Set the fill style of the context to a specific color
    ctx.fillText("Scan to view our menu", 256, 590); // Draw the subtitle on the canvas

    // Convert to buffer and send response
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
