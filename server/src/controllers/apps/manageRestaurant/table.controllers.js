import { Restaurant } from "../../../models/apps/auth/restaurant.models.js";
import { Table } from "../../../models/apps/manageRestaurant/table.models.js";
import { Order } from "../../../models/apps/manageRestaurant/order.models.js";
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
  const { page = 1, limit = 10, status, search, minCapacity = 0 } = req.query;

  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }
  const matchStage = {
    restaurantId: new mongoose.Types.ObjectId(restaurant._id),
  };
  if (search) {
    const sanitizedSearch = search.replace(/[-\s]/g, "").toLowerCase();
    matchStage.title = {
      $regex: new RegExp(`^${sanitizedSearch.replace(/(\d+)/, "-$1")}`, "i"),
    };
  }
  if (status) {
    if (!ENUMS.tableStatus.includes(status)) {
      throw new ApiError(400, "Invalid table status");
    }
  }
  if (minCapacity) matchStage.capacity = { $gte: parseInt(minCapacity) };

  // Define the aggregation pipeline stages
  const pipeline = [
    {
      $match: matchStage,
    },
    { $match: status ? { status } : {} },
  ];

  const tableAggregation = Table.aggregate(pipeline);

  const tables = await Table.aggregatePaginate(tableAggregation, {
    page,
    limit,
    customLabels: {
      totalDocs: "filteredTables",
      docs: "tables",
    },
  });

  // Count occupied tables
  const occupiedTables = await Table.countDocuments({
    restaurantId: restaurant._id,
    status: ENUMS.tableStatus[1],
  });

  // Count free tables
  const freeTables = await Table.countDocuments({
    restaurantId: restaurant._id,
    status: ENUMS.tableStatus[0],
  });

  const totalTables = await Table.countDocuments({
    restaurantId: restaurant._id,
  });

  // If no tables found, return a 404 response
  if (!tables || tables.filteredTables === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "No tables found for this restaurant"));
  }

  // Extend response with additional fields
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { ...tables, occupiedTables, freeTables, totalTables },
        "Tables retrieved successfully"
      )
    );
});

const fetchTableById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const restaurantId = req.restaurant?._id;

  // Check if the table exists
  const table = await Table.findById(id);
  if (!table) {
    throw new ApiError(404, "Table not found");
  }

  // Define the aggregation pipeline stages
  const pipeline = [
    {
      $match: {
        tableId: new mongoose.Types.ObjectId(id),
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
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
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customer",
      },
    },
    {
      $unwind: "$customer",
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
        customer: {
          firstName: "$customer.firstName",
          lastName: "$customer.lastName",
          number: "$customer.number",
        },
        table: "$tableId",
        restaurantId: 1,
        customerId: 1,
        tableId: 1,
        items: 1,
        totalAmount: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  const orders = await Order.aggregate(pipeline);

  if (!orders || orders.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "No orders found for this table"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, orders, "Table orders retrieved successfully"));
});

// Determine the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateQRCode = async (tables, restaurant, baseURL) => {
  baseURL = process.env.BASE_URL;
  const zip = new JSZip();

  for (const table of tables) {
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
  const { tableIds } = req.body;

  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }

  let baseURL = process.env.baseURL;

  const restaurantId = restaurant._id;

  // Find tables with _id from the array of tableIds and belonging to the restaurant
  const tables = await Table.find({
    restaurantId,
    _id: { $in: tableIds },
  }).sort({ title: 1 });

  if (tables.length === 0) {
    throw new ApiError(404, "No tables found within the given ids");
  }

  const zipData = await generateQRCode(tables, restaurant, baseURL);

  // Set response headers and send the ZIP file as a response
  res.set("Content-Type", "application/zip");
  res.set("Content-Disposition", "attachment; filename=table_qr_codes.zip");
  res.send(zipData);
});

const registerTables = asyncHandler(async (req, res) => {
  const {
    letter,
    startTable,
    endTable,
    capacity = 4,
    bulkCreate = false,
  } = req.body;

  // Validate required inputs
  if (!letter || typeof letter !== "string") {
    throw new ApiError(400, "Letter prefix is required and should be a string");
  }

  if (capacity && (!Number.isInteger(capacity) || capacity < 1)) {
    throw new ApiError(400, "Capacity must be an integer");
  }

  if (!Number.isInteger(startTable) || startTable < 1) {
    throw new ApiError(400, "startTable must be a positive integer");
  }

  if (bulkCreate) {
    if (!Number.isInteger(endTable) || endTable < startTable) {
      throw new ApiError(
        400,
        "endTable must be a positive integer and greater than or equal to startTable"
      );
    }
  }

  // Fetch restaurant details
  const restaurant = await Restaurant.findById(req.restaurant?._id);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  if (!restaurant.baseURL) {
    throw new ApiError(400, "Restaurant baseURL is missing. Please update it");
  }

  const tableRange = bulkCreate
    ? [...Array(endTable - startTable + 1).keys()].map((i) => i + startTable)
    : [startTable];

  const bulkOperations = [];
  const newTables = [];

  for (const num of tableRange) {
    const tableTitle = `${letter}-${num}`;

    // Check if table already exists
    const existingTable = await Table.findOne({
      restaurantId: restaurant._id,
      title: tableTitle,
    });

    if (existingTable) {
      if (!bulkCreate) {
        throw new ApiError(409, `Table ${tableTitle} already exists`);
      }
      continue; // Skip existing tables in bulk mode
    }

    const newTable = {
      title: tableTitle,
      restaurantId: restaurant._id,
      baseUrl: restaurant.baseURL,
      capacity,
    };

    bulkOperations.push({ insertOne: { document: newTable } });
    newTables.push(newTable);
  }

  // Insert tables if there are new ones to add
  if (bulkOperations.length > 0) {
    await Table.bulkWrite(bulkOperations);
  }

  res.json(
    new ApiResponse(
      200,
      { createdTables: newTables, totalCreated: newTables.length },
      newTables.length > 0
        ? "Tables created successfully"
        : "No new tables were created"
    )
  );
});

// Delete a specific table by ID
const deleteTableById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Table.findByIdAndDelete(id);

  res.json(new ApiResponse(200, {}, "Table deleted successfully"));
});

const deleteTablesByIds = asyncHandler(async (req, res) => {
  const { tableIds } = req.body;

  // Validate request
  if (!Array.isArray(tableIds) || tableIds.length === 0) {
    throw new ApiError(400, "tableIds must be a non-empty array");
  }

  // Find tables that actually exist
  const existingTables = await Table.find({ _id: { $in: tableIds } });

  // Extract found IDs
  const existingTableIds = existingTables.map((table) => table._id.toString());

  // Find IDs that were not found
  const notFoundIds = tableIds.filter((id) => !existingTableIds.includes(id));

  // Delete only existing tables
  if (existingTableIds.length > 0) {
    await Table.deleteMany({ _id: { $in: existingTableIds } });
  }

  res.json(
    new ApiResponse(
      200,
      {
        deletedIds: existingTableIds,
        notFoundIds,
      },
      existingTableIds.length > 0
        ? `Deleted ${existingTableIds.length} tables successfully`
        : "No tables deleted"
    )
  );
});

const updateTableById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, capacity, status } = req.body;

  // Validate request body
  if (!title && !capacity && !status) {
    throw new ApiError(
      400,
      "At least one field (title, capacity, status) is required to update"
    );
  }

  // Find the table
  const table = await Table.findById(id);
  if (!table) {
    throw new ApiError(404, "Table not found");
  }

  // Ensure new title doesn't already exist
  if (title && title !== table.title) {
    const existingTable = await Table.findOne({
      title,
      restaurantId: table.restaurantId,
    });
    if (existingTable) {
      throw new ApiError(400, `A table with title '${title}' already exists`);
    }
  }

  // Update table
  table.title = title || table.title;
  table.capacity = capacity || table.capacity;
  table.status = status || table.status;

  await table.save();

  res.json(new ApiResponse(200, { table }, "Table updated successfully"));
});

const updateTables = asyncHandler(async (req, res) => {
  const { tableUpdates } = req.body;

  // Ensure tableUpdates is an array and not empty
  if (!Array.isArray(tableUpdates) || tableUpdates.length === 0) {
    throw new ApiError(400, "tableUpdates must be a non-empty array");
  }

  const bulkOperations = [];
  const updatedTables = [];

  for (const update of tableUpdates) {
    const { id, title, capacity, status } = update;

    if (!id) {
      throw new ApiError(400, "Each table update must include an ID");
    }

    // Find the table
    const table = await Table.findById(id);
    if (!table) {
      throw new ApiError(404, `Table with ID ${id} not found`);
    }

    // Check for duplicate title
    if (title && title !== table.title) {
      const existingTable = await Table.findOne({
        title,
        restaurantId: table.restaurantId,
      });
      if (existingTable) {
        throw new ApiError(400, `A table with title '${title}' already exists`);
      }
    }

    // Prepare bulk update operation
    bulkOperations.push({
      updateOne: {
        filter: { _id: id },
        update: { $set: { title, capacity, status } },
      },
    });

    updatedTables.push({ _id: id, title, capacity, status });
  }

  // Execute bulk update
  if (bulkOperations.length > 0) {
    await Table.bulkWrite(bulkOperations);
  }

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
  fetchTableById,
};
