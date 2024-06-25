import { AvailableUserRoles, UserRolesEnum } from "../constants.js";
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
  const ip = req.clientIp;
  const uniqueVisitorId = req.cookies?.visitorId || uuidv4(); // Generate a unique ID if not present

  console.log("ip ===> ", ip);
  console.log("visitorId ===> ", uniqueVisitorId);

  // Set the visitorId cookie if it's not already set
  if (!req.cookies?.visitorId) {
    res.cookie("visitorId", uniqueVisitorId, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    }); // 1 day expiry
  }

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
      console.log("Invalid access token:", error.message);
    }
  }

  if (!restaurantId || restaurantId.toString() !== req.params.restaurantId) {
    restaurantId = req.params.restaurantId;

    if (!restaurantId || restaurantId === "null") {
      throw new ApiError(400, "Restaurant ID is required");
    }

    const subscription = await Subscription.findOne({ restaurantId });

    if (!subscription) {
      throw new ApiError(403, "No subscription found for this restaurant");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const dailyLimit = subscription.plan.dailyCustomerLimit;
    const monthlyLimit = subscription.plan.monthlyCustomerLimit;

    const monthlyVisitorRecords = await Visitor.find({
      restaurantId,
      visitDate: { $gte: firstDayOfMonth },
    });

    const totalMonthlyVisitors = monthlyVisitorRecords.reduce(
      (acc, record) => acc + record.ips.length,
      0
    );

    if (totalMonthlyVisitors >= monthlyLimit) {
      throw new ApiError(
        403,
        "Monthly customer limit exceeded for this restaurant"
      );
    }

    let visitorRecord = await Visitor.findOne({
      restaurantId,
      visitDate: today,
    });

    if (!visitorRecord) {
      visitorRecord = new Visitor({
        restaurantId,
        visitDate: today,
        ips: [{ ip, visitorId: uniqueVisitorId }],
      });
    } else {
      if (visitorRecord.ips.length >= dailyLimit) {
        throw new ApiError(
          403,
          "Daily customer limit exceeded for this restaurant"
        );
      }

      if (
        !visitorRecord.ips.some(
          (visitor) => visitor.visitorId === uniqueVisitorId
        )
      ) {
        visitorRecord.ips.push({ ip, visitorId: uniqueVisitorId });
      }
    }

    await visitorRecord.save();
  }

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
    if (restaurant.role !== UserRolesEnum.ADMIN) {
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
