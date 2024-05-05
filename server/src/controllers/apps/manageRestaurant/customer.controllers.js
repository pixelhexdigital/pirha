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

const registerCustomer = asyncHandler(async (req, res) => {
  const { firstName, lastName, number } = req;
  const customer = await Customer.findOne({ number: number });

  if (customer) {
    throw new ApiError(401, "Customer with given number already exist");
  }
  const newCustomer = await customer.create({
    firstName,
    lastName,
    number,
  });

  const { accessToken } = await generateAccessToken(newCustomer._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { restaurant: newCustomer, accessToken },
        "Customer registered successfully"
      )
    );
});

const loginCustomer = asyncHandler(async (req, res) => {
  const { number } = req;
  const customer = await Customer.find({ number: number });
  if (!customer) {
    throw new ApiError(404, "Customer with given number not found");
  }

  const { accessToken } = await generateAccessToken(customer._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { customer: customer, accessToken },
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
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Customer logged out"));
});

export { registerCustomer, loginCustomer, logoutCustomer, updateCustomer };
