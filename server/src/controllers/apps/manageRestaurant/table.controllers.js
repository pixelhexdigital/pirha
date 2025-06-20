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

// Generate and cache the background canvas
const createBackgroundCanvas = () => {
  const bgCanvas = createCanvas(512, 728);
  const ctx = bgCanvas.getContext("2d");

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, 512, 728);
  gradient.addColorStop(0, "#1E3A8A");
  gradient.addColorStop(1, "#2563EB");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 728);

  // Accent shapes
  ctx.fillStyle = "#EC4899";
  ctx.beginPath();
  ctx.arc(480, 30, 150, 0, Math.PI * 3.5);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(20, 680, 150, 0, Math.PI * 3.5);
  ctx.fill();

  return bgCanvas;
};

const generateQRCode = async (tables, restaurant, baseURL) => {
  baseURL = process.env.BASE_URL || baseURL;
  const zip = new JSZip();
  const bgCanvas = createBackgroundCanvas(); // Cached once

  for (const table of tables) {
    const canvas = createCanvas(512, 728);
    const ctx = canvas.getContext("2d");

    // Draw cached background
    ctx.drawImage(bgCanvas, 0, 0);

    const qrCodeText = `${baseURL}?tableId=${table._id}&restaurantId=${restaurant._id}`;

    // Generate QR Code
    const qrCanvas = createCanvas(200, 200);
    await QRCode.toCanvas(qrCanvas, qrCodeText, {
      color: { dark: "#000", light: "#fff" },
      width: 180,
      margin: 5,
      errorCorrectionLevel: "H",
      scale: 10,
    });

    // Draw white card background
    ctx.fillStyle = "#fff";
    ctx.roundRect(106, 200, 300, 300, 25);
    ctx.fill();
    ctx.drawImage(qrCanvas, 116, 210, 280, 280);

    // Draw avatar if available
    if (restaurant.avatar?.url) {
      try {
        const avatarImage = await loadImage(restaurant.avatar.url);
        ctx.save();
        ctx.beginPath();
        ctx.arc(80, 145, 35, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImage, 45, 110, 70, 70);
        ctx.restore();
      } catch (error) {
        console.error(`Failed to load avatar: ${error.message}`);
      }
    }

    // Draw restaurant name
    ctx.font = "bold 32px Poppins, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    const restaurantName = restaurant.restroName || "";
    const maxLineWidth = 370;
    const lineHeight = 32;
    const lines = [];
    let line = "";
    const words = restaurantName.split(" ");

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineWidth && i > 0) {
        lines.push(line);
        line = words[i] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    let y = 140;
    const limit = lines.length > 2 ? 2 : lines.length;
    if (limit === 1) y += 16;
    for (let i = 0; i < limit; i++) {
      ctx.fillText(lines[i], 125, y + i * lineHeight);
    }

    // Table title
    ctx.font = "bold 40px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${table.title.toUpperCase()}`, 256, 550);

    // Subtitle
    ctx.font = "22px Poppins, sans-serif";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText("Scan to view our menu", 256, 590);

    // Add PNG to ZIP
    const buffer = canvas.toBuffer("image/png");
    zip.file(`${table.title}.png`, buffer);
  }

  return await zip.generateAsync({ type: "nodebuffer" });
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
