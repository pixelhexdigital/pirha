import { Restaurant } from "../../../models/apps/auth/restaurant.models.js";
import { Customer } from "../../../models/apps/manageRestaurant/customer.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const generateAccessToken = async (userId) => {
  try {
    const customer = await Customer.findById(userId);

    const accessToken = customer.generateAccessToken();
    return { accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating the access token"
    );
  }
};

const handleCustomer = asyncHandler(async (req, res) => {
  const { firstName, lastName, number, restaurantId } = req.body;

  let restaurant = null;

  // Check if restaurantId is provided and fetch the restaurant
  if (restaurantId) {
    restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found");
    }
  }

  // Check if the customer already exists
  let customer = await Customer.findOne({ number });

  if (!customer) {
    // Customer does not exist, proceed with registration
    if (!firstName) {
      throw new ApiError(400, "First name is required for registration");
    }

    // Create a new customer
    customer = new Customer({
      firstName,
      lastName,
      number,
    });

    // Save the customer
    await customer.save();
  }

  // Associate the customer with a restaurant if needed
  if (restaurant) {
    // Add the restaurant to the customer's restaurants array if not already added
    if (!customer.restaurants.includes(restaurant._id)) {
      customer.restaurants.push(restaurant);
      await customer.save();
    }

    // Add the customer to the restaurant's customers array if not already added
    if (!restaurant.customers.includes(customer._id)) {
      restaurant.customers.push(customer);
      await restaurant.save();
    }
  }

  // Generate access token
  const { accessToken } = await generateAccessToken(customer._id);

  // Set cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // Determine the response message
  const message = customer.isNew
    ? "Customer registered successfully"
    : "Customer logged in successfully";

  // Send response
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, { customer, accessToken }, message));
});

const updateCustomer = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req;

  const customer = await Customer.findById(req.customer?._id);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }
  const updatedCustomer = await Customer.findByIdAndUpdate(
    customer?._id,
    {
      $set: {
        firstName,
        lastName,
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedCustomer },
        "Customer details updated successfully"
      )
    );
});

const logoutCustomer = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "Customer logged out"));
});

export { handleCustomer, logoutCustomer, updateCustomer };
