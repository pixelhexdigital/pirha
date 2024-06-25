import { ENUMS } from "../../constants/enum.js";
import { Restaurant } from "../../models/apps/auth/restaurant.models.js";
import {
  Subscription,
  SubscriptionPlan,
} from "../../models/apps/manageRestaurant/subscription.models.js";
import { Menu } from "../../models/apps/manageRestaurant/menu.models.js"; // Import the Menu model
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { subscriptionPlans } from "../../constants/subscriptionConfigs.js";

const changePlan = asyncHandler(async (req, res) => {
  const { restaurantId, plan, reffererId, days } = req.body;
  const admin = req.restaurant;

  if (!restaurantId || !plan) {
    throw new ApiError(401, "Please provide all details");
  }

  // Calculate the end date based on the provided days or default to 30 days
  const endDate = new Date();
  const durationDays = days ? days : 30;
  endDate.setDate(endDate.getDate() + durationDays);

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(401, "No restaurant found for given restaurantId");
  }

  const isValidPlan = ENUMS.subscriptionPlan.includes(plan);
  if (!isValidPlan) {
    throw new ApiError(401, "Please select a valid plan");
  }

  let subscription = await Subscription.findOne({ restaurantId: restaurantId });
  const planDetails = subscriptionPlans.find((e) => e.name === plan);

  if (!planDetails) {
    throw new ApiError(401, "Subscription plan details not found");
  }

  let subscriptionPlan = await SubscriptionPlan.findOne({ name: plan });
  if (!subscriptionPlan) {
    subscriptionPlan = await SubscriptionPlan.create(planDetails);
  }

  if (subscription) {
    // Update the existing subscription
    subscription.plan = subscriptionPlan._id;
    subscription.endDate = endDate;
    await subscription.save();
  } else {
    // Create a new subscription
    subscription = await Subscription.create({
      restaurantId: restaurant._id,
      plan: subscriptionPlan._id,
      endDate: endDate,
    });
  }

  // Fetch the subscription plan limits
  const { menuCategoryLimit, menuItemLimit } = planDetails;

  // Fetch the restaurant's menu
  const menu = await Menu.findOne({ restaurantId: restaurantId });
  if (!menu) {
    throw new ApiError(401, "No menu found for the given restaurantId");
  }

  // Deactivate excess menu categories
  const activeCategories = menu.categories.filter(
    (category) => category.isActive
  );
  if (activeCategories.length > menuCategoryLimit) {
    activeCategories.forEach((category, index) => {
      if (index >= menuCategoryLimit) {
        category.isActive = false;
      }
    });
  }

  // Deactivate excess menu items in each active category
  activeCategories.forEach((category) => {
    const activeItems = category.items.filter((item) => item.isActive);
    if (activeItems.length > menuItemLimit) {
      activeItems.forEach((item, index) => {
        if (index >= menuItemLimit) {
          item.isActive = false;
        }
      });
    }
  });

  // Save the updated menu
  await menu.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "OK", "Plan changed successfully"));
});

export { changePlan };
