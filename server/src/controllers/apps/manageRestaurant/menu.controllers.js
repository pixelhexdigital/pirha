import { Restaurant } from "../../../models/apps/auth/restaurant.models.js";
import { Menu } from "../../../models/apps/manageRestaurant/menu.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../../utils/cloudinary.js";

// Fetch all menus for a restaurant
const fetchMenus = asyncHandler(async (req, res) => {
  const menus = await Menu.find();
  res
    .status(200)
    .json(new ApiResponse(200, { menus }, "Menus fetched successfully"));
});

// Fetch menu by ID for a restaurant
const fetchMenuByRestraurnt = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }

  const menu = await Menu.findOne({ restaurantId: restaurant._id });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, { menu }, "Menu fetched successfully"));
});

// Delete menu by ID for a restaurant
const deleteMenuById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const menu = await Menu.findOneAndDelete({
    _id: id,
  });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  if (menu.categories) {
    throw new ApiError(404, "Categories must be deleted first to delete menu");
  }

  res.status(200).json(new ApiResponse(200, {}, "Menu deleted successfully"));
});

// Add a new category to a menu
const addCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }
  const menu = await Menu.findOne({ restaurantId: restaurant._id });

  if (!menu) {
    menu = await Menu.create({
      restaurantId: restaurant._id,
      categories: [
        { name: "Starter", items: [] },
        { name: "Main Course", items: [] },
        { name: "Dessert", items: [] },
      ],
    });
  }

  menu.categories.push({ name, items: [] });
  await menu.save();

  res.status(201).json(new ApiResponse(201, {}, "Category added successfully"));
});

// Update a category in a menu
const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }
  const { name } = req.body;
  const menu = await Menu.findOne({ restaurantId: restaurant._id });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  const category = menu.categories.id(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  category.name = name;
  await menu.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Category updated successfully"));
});

// Delete a category from a menu along with its items
const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const restaurantId = req.restaurant?._id;

  // Find the menu associated with the restaurant
  const menu = await Menu.findOne({ restaurantId });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  // Find the category within the menu by its ID
  const category = menu.categories.find((cat) => cat._id.equals(categoryId));

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Extract item IDs from the category
  const itemIds = category.items.map((item) => item._id);

  if (itemIds && itemIds.length) {
    throw new ApiError(404, "Category containing items can not be deleted");
  }

  // Delete all items associated with the category
  await Menu.updateOne(
    { restaurantId },
    { $pull: { "categories.$[cat].items": { _id: { $in: itemIds } } } },
    { arrayFilters: [{ "cat._id": categoryId }] }
  );

  // Remove the category from the categories array
  menu.categories = menu.categories.filter(
    (cat) => !cat._id.equals(categoryId)
  );

  // Save the updated menu
  await menu.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Category deleted successfully"));
});

// Add a menu item to a category in a menu
const addMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }
  const { categoryId } = req.params;
  const { title, description, price, discount } = req.body;
  const menu = await Menu.findOne({ restaurantId: restaurant._id });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  const category = menu.categories.id(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  category.items.push({
    title,
    description,
    price,
    discount,
  });
  await menu.save();

  res
    .status(201)
    .json(new ApiResponse(201, {}, "Menu item added successfully"));
});

// Update a menu item in a category in a menu
const updateMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }
  const { categoryId, itemId } = req.params;
  const { title, description, price, discount } = req.body;
  const menu = await Menu.findOne({ restaurantId: restaurant._id });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  const category = menu.categories.id(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const item = category.items.id(itemId);

  if (!item) {
    throw new ApiError(404, "Menu item not found");
  }

  Object.assign(item, {
    title,
    description,
    price,
    discount,
  });
  await menu.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Menu item updated successfully"));
});

// Delete a menu item from a category in a menu
const deleteMenuItem = asyncHandler(async (req, res) => {
  const { categoryId, itemId } = req.params;
  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }
  const restaurantId = restaurant._id;

  // Find the menu associated with the restaurant
  const menu = await Menu.findOne({ restaurantId });

  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  // Find the category within the menu by its ID
  const category = menu.categories.find((cat) => cat._id.equals(categoryId));

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Find the item within the category by its ID
  const itemIndex = category.items.findIndex((item) => item._id.equals(itemId));

  if (itemIndex === -1) {
    throw new ApiError(404, "Menu item not found");
  }

  const item = category.items[itemIndex];

  // Remove associated image from Cloudinary if it exists
  if (item.image && item.image.public_id) {
    await removeFromCloudinary(item.image.public_id);
  }

  // Remove the item from the items array of the category
  category.items.splice(itemIndex, 1);

  // Save the updated menu
  await menu.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Menu item deleted successfully"));
});

// upload image for item
const updateItemImage = asyncHandler(async (req, res) => {
  const { categoryId, itemId } = req.params;
  const itemLocalPath = req.file?.path;

  if (!itemLocalPath) {
    throw new ApiError(400, "Item image file is missing");
  }

  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }

  // Fetch the menu and validate its existence
  const menu = await Menu.findOne({ restaurantId: restaurant._id });
  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  // Find the category within the menu
  const category = menu.categories.id(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Find the item within the category
  const item = category.items.id(itemId);
  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  // Upload item image to Cloudinary
  const publicId = item.image?.public_id || null;
  const uploadedImage = await uploadOnCloudinary(itemLocalPath, publicId);
  //   console.log(uploadedImage);

  if (!uploadedImage.url) {
    throw new ApiError(400, "Error while uploading item image");
  }

  // Update item with the new image URL and public_id
  item.image = {
    url: uploadedImage.url,
    public_id: uploadedImage.public_id,
  };

  // Save the updated menu
  await menu.save();

  // Return success response with updated item
  res
    .status(200)
    .json(new ApiResponse(200, item, "Item image updated successfully"));
});

export {
  fetchMenus,
  fetchMenuByRestraurnt,
  deleteMenuById,
  addCategory,
  updateCategory,
  deleteCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateItemImage,
};
