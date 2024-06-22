import { AvailableUserRoles } from "../constants.js";
import { Restaurant } from "../models/apps/auth/restaurant.models.js";
import { Visitor } from "../models/apps/manageRestaurant/visitor.models.js";
import { Subscription } from "../models/apps/manageRestaurant/subscription.models.js";
import { Customer } from "../models/apps/manageRestaurant/customer.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const restaurant = await Restaurant.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    if (!restaurant) {
      // Client should make a request to /api/v1/users/refresh-token if they have refreshToken present in their cookie
      // Then they will get a new access token which will allow them to refresh the access token without logging out the restaurant
      throw new ApiError(401, "Invalid access token");
    }
    req.restaurant = restaurant;
    next();
  } catch (error) {
    // Client should make a request to /api/v1/users/refresh-token if they have refreshToken present in their cookie
    // Then they will get a new access token which will allow them to refresh the access token without logging out the restaurant
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const verifySubscription = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  const ip = req.ip;

  console.log("ip ===> ", ip);

  let restaurantId;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const restaurant = await Restaurant.findById(decodedToken?._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
      );
      if (restaurant) {
        req.restaurant = restaurant;
        restaurantId = restaurant._id;
      }
    } catch (error) {
      // If token verification fails, log the error but don't throw an ApiError
      console.log("Invalid access token:", error.message);
    }
  }

  if (!restaurantId || restaurantId.toString() !== req.params.restaurantId) {
    // If the restaurant is not authenticated, assume it's a visitor
    restaurantId = req.params.restaurantId;

    if (!restaurantId) {
      throw new ApiError(400, "Restaurant ID is required");
    }

    // Fetch the subscription details
    const subscription = await Subscription.findOne({ restaurantId });

    if (!subscription) {
      throw new ApiError(403, "No subscription found for this restaurant");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let visitorRecord = await Visitor.findOne({
      restaurantId,
      visitDate: today,
    });

    // Check the subscription limits
    const dailyLimit = subscription.plan.dailyCustomerLimit;

    if (!visitorRecord) {
      visitorRecord = new Visitor({
        restaurantId,
        visitDate: today,
        ips: [{ ip }],
      });
    } else {
      if (visitorRecord.ips.length > dailyLimit) {
        throw new ApiError(
          403,
          "Daily customer limit exceeded for this restaurant"
        );
      }

      // Check if the IP is already recorded
      if (!visitorRecord.ips.some((visitor) => visitor.ip === ip)) {
        visitorRecord.ips.push({ ip });
      }
    }

    await visitorRecord.save();
  }

  // Proceed if the restaurant is authenticated or the visitor's IP is valid
  next();
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const restaurant = await Restaurant.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    if (!restaurant) {
      // Client should make a request to /api/v1/users/refresh-token if they have refreshToken present in their cookie
      // Then they will get a new access token which will allow them to refresh the access token without logging out the restaurant
      throw new ApiError(401, "Invalid access token");
    }
    if (restaurant.role !== "admin") {
      throw new ApiError(401, "Invalid role");
    }
    req.restaurant = restaurant;
    next();
  } catch (error) {
    // Client should make a request to /api/v1/users/refresh-token if they have refreshToken present in their cookie
    // Then they will get a new access token which will allow them to refresh the access token without logging out the restaurant
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const verifyCustomer = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const customer = await Customer.findById(decodedToken?._id);
    if (!customer) {
      // Client should make a request to /api/v1/users/refresh-token if they have refreshToken present in their cookie
      // Then they will get a new access token which will allow them to refresh the access token without logging out the restaurant
      throw new ApiError(401, "Invalid access token");
    }

    req.customer = customer;
    next();
  } catch (error) {
    // Client should make a request to /api/v1/users/refresh-token if they have refreshToken present in their cookie
    // Then they will get a new access token which will allow them to refresh the access token without logging out the restaurant
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

/**
 *
 * @description Middleware to check logged in users for unprotected routes. The function will set the logged in restaurant to the request object and, if no restaurant is logged in, it will silently fail.
 *
 * `NOTE: THIS MIDDLEWARE IS ONLY TO BE USED FOR UNPROTECTED ROUTES IN WHICH THE LOGGED IN USER'S INFORMATION IS NEEDED`
 */
export const getLoggedInUserOrIgnore = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const restaurant = await Restaurant.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    req.restaurant = restaurant;
    next();
  } catch (error) {
    // Fail silently with req.restaurant being falsy
    next();
  }
});

/**
 * @param {AvailableUserRoles} roles
 * @description
 * * This middleware is responsible for validating multiple restaurant role permissions at a time.
 * * So, in future if we have a route which can be accessible by multiple roles, we can achieve that with this middleware
 */
export const verifyPermission = (roles = []) =>
  asyncHandler(async (req, res, next) => {
    if (!req.restaurant?._id) {
      throw new ApiError(401, "Unauthorized request");
    }
    if (roles.includes(req.restaurant?.role)) {
      next();
    } else {
      throw new ApiError(403, "You are not allowed to perform this action");
    }
  });

export const avoidInProduction = asyncHandler(async (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    next();
  } else {
    throw new ApiError(
      403,
      "This service is only available in the local environment. For more details visit: https://github.com/hiteshchoudhary/apihub/#readme"
    );
  }
});
