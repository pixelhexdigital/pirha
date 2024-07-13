import { ENUMS } from "../../constants/enum.js";
import { Restaurant } from "../../models/apps/auth/restaurant.models.js";
import { Subscription } from "../../models/apps/manageRestaurant/subscription.models.js";
import { Menu } from "../../models/apps/manageRestaurant/menu.models.js"; // Import the Menu model
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { subscriptionPlans } from "../../constants/subscriptionConfigs.js";

const getPlanDetails = (plan) => {
  const isValidPlan = ENUMS.subscriptionPlan.includes(plan);
  if (!isValidPlan) {
    throw new ApiError(401, "Please select a valid plan");
  }
  const planDetails = subscriptionPlans.find((e) => e.name === plan);
  if (!planDetails) {
    throw new ApiError(401, "Subscription plan details not found");
  }
  return planDetails;
};

const calculateEndDate = (days) => {
  const endDate = new Date();
  const durationDays = days || 30;
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate;
};

const updateOrCreateSubscription = async (
  restaurantId,
  planDetails,
  endDate
) => {
  let subscription = await Subscription.findOne({ restaurantId }).populate(
    "plan"
  );
  if (subscription) {
    subscription.plan = planDetails;
    subscription.endDate = endDate;
    await subscription.save();
  } else {
    subscription = await Subscription.create({
      restaurantId,
      plan: planDetails,
      endDate,
    });
  }
};

const updateMenuCategoriesAndItems = (
  menu,
  menuCategoryLimit,
  menuItemLimit
) => {
  const activeCategories = menu.categories.filter(
    (category) => category.isActive
  );

  activeCategories.forEach((category, index) => {
    if (index >= menuCategoryLimit) {
      category.isActive = false;
    } else {
      const activeItems = category.items.filter((item) => item.isActive);
      activeItems.forEach((item, itemIndex) => {
        if (itemIndex >= menuItemLimit) {
          item.isActive = false;
        }
      });
    }
  });

  return activeCategories;
};

const changePlanLogic = async (restaurantId, plan, days) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(401, "No restaurant found for given restaurantId");
  }

  const planDetails = getPlanDetails(plan);
  const endDate = calculateEndDate(days);

  await updateOrCreateSubscription(restaurantId, planDetails, endDate);

  const { menuCategoryLimit, menuItemLimit } = planDetails;
  const menu = await Menu.findOne({ restaurantId });
  if (!menu) {
    throw new ApiError(401, "No menu found for the given restaurantId");
  }

  updateMenuCategoriesAndItems(menu, menuCategoryLimit, menuItemLimit);

  await menu.save();
};

const changePlan = asyncHandler(async (req, res, next) => {
  const { restaurantId, plan, days } = req.body;

  if (!restaurantId || !plan) {
    throw new ApiError(401, "Please provide all details");
  }

  await changePlanLogic(restaurantId, plan, days);

  res.status(200).json(new ApiResponse(200, "OK", "Plan changed successfully"));
});

const changePlanHandler = asyncHandler(async (req, res, next) => {
  const { restaurantId, plan, days } = req.body;

  if (!restaurantId || !plan) {
    throw new ApiError(401, "Please provide all details");
  }

  await changePlanLogic(restaurantId, plan, days);

  next();
});

export { changePlan, changePlanHandler };
