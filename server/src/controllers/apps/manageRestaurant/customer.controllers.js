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

// Register a new customer and associate with a restaurant
const registerCustomer = asyncHandler(async (req, res) => {
  const { firstName, lastName, number, restaurantId } = req.body;

  // Check if the customer already exists
  let customer = await Customer.findOne({ number });

  if (customer) {
    throw new ApiError(401, "Customer with given number already exists");
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // Create a new customer
  customer = new Customer({
    firstName,
    lastName,
    number,
  });

  // Save the customer
  await customer.save();

  // Associate the customer with a restaurant
  if (restaurantId) {
    // Add the restaurant to the customer's restaurants array
    customer.restaurants.push(restaurant);
    await customer.save();

    // Add the customer to the restaurant's customers array
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

  // Send response
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { customer, accessToken },
        "Customer registered successfully"
      )
    );
});

// Login a customer and associate with a restaurant
const loginCustomer = asyncHandler(async (req, res) => {
  const { number, restaurantId } = req.body;

  // Find the customer by number
  const customer = await Customer.findOne({ number });

  if (!customer) {
    throw new ApiError(404, "Customer with given number not found");
  }

  // Associate the customer with a restaurant
  if (restaurantId) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found");
    }
    // Add the restaurant to the customer's restaurants array
    if (!customer.restaurants.includes(restaurant._id)) {
      customer.restaurants.push(restaurant);
      await customer.save();
    }

    // Add the customer to the restaurant's customers array
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

  // Send response
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { customer, accessToken },
        "Customer logged in successfully"
      )
    );
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

export { registerCustomer, loginCustomer, logoutCustomer, updateCustomer };
