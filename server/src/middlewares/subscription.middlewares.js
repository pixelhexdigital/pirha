import { Restaurant } from "../models/apps/auth/restaurant.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Visitor } from "../models/visitor.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Middleware to verify if the restaurant has a valid subscription and check daily customer limits
export const checkSubscriptionLimits = asyncHandler(async (req, res, next) => {
  const restaurantId = req.restaurant._id;
  const ip = req.ip;

  const subscription = await Subscription.findOne({ restaurantId });

  if (!subscription) {
    throw new ApiError(403, "Subscription not found");
  }

  // Check if the subscription is active
  if (!subscription.active) {
    throw new ApiError(403, "Subscription is not active");
  }

  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find or create the visitor record for today
  let visitorRecord = await Visitor.findOne({ restaurantId });

  if (!visitorRecord) {
    visitorRecord = new Visitor({
      restaurantId,
      ips: [{ ip, timestamp: Date.now() }],
    });
  } else {
    // Remove expired IPs (older than 1 day)
    visitorRecord.ips = visitorRecord.ips.filter(
      (visitor) => new Date() - visitor.timestamp < 24 * 60 * 60 * 1000
    );

    // Check if IP already exists
    const existingIp = visitorRecord.ips.find((visitor) => visitor.ip === ip);

    if (!existingIp) {
      visitorRecord.ips.push({ ip, timestamp: Date.now() });
    } else {
      // If IP already exists, just proceed
      return next();
    }
  }

  // Check if the daily visitor limit is reached
  if (visitorRecord.ips.length > subscription.plan.dailyCustomerLimit) {
    return next(new ApiError(403, "Daily visitor limit reached"));
  }

  // Save the visitor record
  await visitorRecord.save();

  next();
});

// Schedule the daily reset of visitor records
import cron from "node-cron";

cron.schedule("0 6 * * *", async () => {
  try {
    const visitors = await Visitor.find({});
    visitors.forEach(async (visitor) => {
      visitor.ips = visitor.ips.filter(
        (v) => new Date() - v.timestamp < 24 * 60 * 60 * 1000
      );
      if (visitor.ips.length === 0) {
        await Visitor.deleteOne({ _id: visitor._id });
      } else {
        await visitor.save();
      }
    });

    console.log("Visitor data cleaned up at 6:00 AM");
  } catch (error) {
    console.error("Error cleaning up visitor data:", error);
  }
});

export const verifySubscription = asyncHandler(async (req, res, next) => {
  const restaurantId = req.restaurant._id;

  const subscription = await Subscription.findOne({ restaurantId });

  if (!subscription) {
    throw new ApiError(403, "Subscription not found");
  }

  if (!subscription.active) {
    throw new ApiError(403, "Subscription is not active");
  }

  const now = new Date();
  const lastResetDate = subscription.lastMonthlyReset || subscription.startDate;
  const daysSinceLastReset = Math.floor(
    (now - lastResetDate) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastReset >= 30) {
    subscription.monthlyCustomerCount = 0;
    subscription.lastMonthlyReset = Date.now();
    await subscription.save();
  }

  next();
});

export const checkMenuCategoryLimit = asyncHandler(async (req, res, next) => {
  const restaurantId = req.restaurant._id;

  const subscription = await Subscription.findOne({ restaurantId });

  if (!subscription) {
    throw new ApiError(403, "Subscription not found");
  }

  const menu = await Menu.findOne({ restaurantId });

  if (menu.categories.length >= subscription.plan.menuCategoryLimit) {
    throw new ApiError(403, "Menu category limit reached");
  }

  next();
});

export const checkMenuItemLimit = asyncHandler(async (req, res, next) => {
  const restaurantId = req.restaurant._id;

  const subscription = await Subscription.findOne({ restaurantId });

  if (!subscription) {
    throw new ApiError(403, "Subscription not found");
  }

  const menu = await Menu.findOne({ restaurantId });
  const categoryId = req.params.categoryId;
  const category = menu.categories.id(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (category.items.length >= subscription.plan.menuItemLimit) {
    throw new ApiError(403, "Menu item limit reached");
  }

  next();
});
