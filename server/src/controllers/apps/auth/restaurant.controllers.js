import crypto from "crypto";
import jwt from "jsonwebtoken";
import { UserLoginType, UserRolesEnum } from "../../../constants.js";
import { Restaurant } from "../../../models/apps/auth/restaurant.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { removeLocalFile } from "../../../utils/helpers.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../../../utils/mail.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const restaurant = await Restaurant.findById(userId);

    const accessToken = restaurant.generateAccessToken();
    const refreshToken = restaurant.generateRefreshToken();

    // attach refresh token to the restaurant document to avoid refreshing the access token with multiple refresh tokens
    restaurant.refreshToken = refreshToken;

    await restaurant.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating the access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  const existedUser = await Restaurant.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "Restaurant with email or username already exists",
      []
    );
  }

  const restaurant = await Restaurant.create({
    email,
    password,
    username,
    isEmailVerified: false,
    role: role || UserRolesEnum.USER,
  });

  /**
   * unHashedToken: unHashed token is something we will send to the restaurant's mail
   * hashedToken: we will keep record of hashedToken to validate the unHashedToken in verify email controller
   * tokenExpiry: Expiry to be checked before validating the incoming token
   */
  const { unHashedToken, hashedToken, tokenExpiry } =
    restaurant.generateTemporaryToken();

  /**
   * assign hashedToken and tokenExpiry in DB till restaurant clicks on email verification link
   * The email verification is handled by {@link verifyEmail}
   */
  restaurant.emailVerificationToken = hashedToken;
  restaurant.emailVerificationExpiry = tokenExpiry;
  await restaurant.save({ validateBeforeSave: false });

  await sendEmail({
    email: restaurant?.email,
    subject: "Please verify your email for BNM-India",
    mailgenContent: emailVerificationMailgenContent(
      restaurant.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
    ),
  });

  const createdUser = await Restaurant.findById(restaurant._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the restaurant"
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { restaurant: createdUser },
        "Users registered successfully and verification email has been sent on your email."
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    throw new ApiError(400, "Username or email is required");
  }

  const restaurant = await Restaurant.findOne({
    $or: [{ username: username }, { email: username }],
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }

  if (restaurant.loginType !== UserLoginType.EMAIL_PASSWORD) {
    // If restaurant is registered with some other method, we will ask him/her to use the same method as registered.
    // This shows that if restaurant is registered with methods other than email password, he/she will not be able to login with password. Which makes password field redundant for the SSO
    throw new ApiError(
      400,
      "You have previously registered using " +
        restaurant.loginType?.toLowerCase() +
        ". Please use the " +
        restaurant.loginType?.toLowerCase() +
        " login option to access your account."
    );
  }

  // Compare the incoming password with hashed password
  const isPasswordValid = await restaurant.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid restaurant credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    restaurant._id
  );

  // get the restaurant document ignoring the password and refreshToken field
  const loggedInUser = await Restaurant.findById(restaurant._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  // TODO: Add more options to make cookie more secure and reliable
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
    .json(
      new ApiResponse(
        200,
        { restaurant: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
        "Restaurant logged in successfully"
      )
    );
});
const verifyUsername = asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username) {
    throw new ApiError(400, "Username  is required");
  }

  const lowercaseUsername = username.toLowerCase();

  const restaurant = await Restaurant.findOne({ username: lowercaseUsername });

  if (restaurant) {
    throw new ApiError(404, "Restaurant already exist");
  }

  return res.status(200).json(new ApiResponse(200, {}, "Username available"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await Restaurant.findByIdAndUpdate(
    req.restaurant._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Restaurant logged out"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiError(400, "Email verification token is missing");
  }

  // generate a hash from the token that we are receiving
  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // While registering the restaurant, same time when we are sending the verification mail
  // we have saved a hashed value of the original email verification token in the db
  // We will try to find restaurant with the hashed token generated by received token
  // If we find the restaurant another check is if token expiry of that token is greater than current time if not that means it is expired
  const restaurant = await Restaurant.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!restaurant) {
    throw new ApiError(489, "Token is invalid or expired");
  }

  // If we found the restaurant that means the token is valid
  // Now we can remove the associated email token and expiry date as we no  longer need them
  restaurant.emailVerificationToken = undefined;
  restaurant.emailVerificationExpiry = undefined;
  // Tun the email verified flag to `true`
  restaurant.isEmailVerified = true;
  await restaurant.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, { isEmailVerified: true }, "Email is verified"));
});

// This controller is called when restaurant is logged in and he has snackbar that your email is not verified
// In case he did not get the email or the email verification token is expired
// he will be able to resend the token while he is logged in
const resendEmailVerification = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exists", []);
  }

  // if email is already verified throw an error
  if (restaurant.isEmailVerified) {
    throw new ApiError(409, "Email is already verified!");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    restaurant.generateTemporaryToken(); // generate email verification creds

  restaurant.emailVerificationToken = hashedToken;
  restaurant.emailVerificationExpiry = tokenExpiry;
  await restaurant.save({ validateBeforeSave: false });

  await sendEmail({
    email: restaurant?.email,
    subject: "Please verify your email for BNM-India",
    mailgenContent: emailVerificationMailgenContent(
      restaurant.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
    ),
  });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Mail has been sent to your mail ID"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const restaurant = await Restaurant.findById(decodedToken?._id);
    if (!restaurant) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // check if incoming refresh token is same as the refresh token attached in the restaurant document
    // This shows that the refresh token is used or not
    // Once it is used, we are replacing it with new refresh token below
    if (incomingRefreshToken !== restaurant?.refreshToken) {
      // If token is valid but is used already
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(restaurant._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Get email from the client and check if restaurant exists
  const restaurant = await Restaurant.findOne({ email });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exists", []);
  }

  // Generate a temporary token
  const { unHashedToken, hashedToken, tokenExpiry } =
    restaurant.generateTemporaryToken(); // generate password reset creds

  // save the hashed version a of the token and expiry in the DB
  restaurant.forgotPasswordToken = hashedToken;
  restaurant.forgotPasswordExpiry = tokenExpiry;
  await restaurant.save({ validateBeforeSave: false });

  // Send mail with the password reset link. It should be the link of the frontend url with token
  await sendEmail({
    email: restaurant?.email,
    subject: "Password reset request",
    mailgenContent: forgotPasswordMailgenContent(
      restaurant.username,
      // ! NOTE: Following link should be the link of the frontend page responsible to request password reset
      // ! Frontend will send the below token with the new password in the request body to the backend reset password endpoint
      // * Ideally take the url from the .env file which should be teh url of the frontend
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/reset-password/${unHashedToken}`
    ),
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset mail has been sent on your mail id"
      )
    );
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  // Create a hash of the incoming reset token

  let hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // See if restaurant with hash similar to resetToken exists
  // If yes then check if token expiry is greater than current date

  const restaurant = await Restaurant.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  // If either of the one is false that means the token is invalid or expired
  if (!restaurant) {
    throw new ApiError(489, "Token is invalid or expired");
  }

  // if everything is ok and token id valid
  // reset the forgot password token and expiry
  restaurant.forgotPasswordToken = undefined;
  restaurant.forgotPasswordExpiry = undefined;

  // Set the provided password as the new password
  restaurant.password = newPassword;
  await restaurant.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const restaurant = await Restaurant.findById(req.restaurant?._id);

  // check the old password
  const isPasswordValid = await restaurant.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password");
  }

  // assign new password in plain text
  // We have a pre save method attached to restaurant schema which automatically hashes the password whenever added/modified
  restaurant.password = newPassword;
  await restaurant.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const assignRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const restaurant = await Restaurant.findById(userId);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }
  if (restaurant.role !== "admin") {
    throw new ApiError(404, "Only Admin can change restaurant roles");
  }
  restaurant.role = role;
  await restaurant.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Role changed for the restaurant"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.restaurant,
        "Current restaurant fetched successfully"
      )
    );
});

const handleSocialLogin = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.restaurant?._id);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant does not exist");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    restaurant._id
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(301)
    .cookie("accessToken", accessToken, options) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
    .redirect(
      // redirect restaurant to the frontend with access and refresh token in case restaurant is not using cookies
      `${process.env.CLIENT_SSO_REDIRECT_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
});

export {
  assignRole,
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  handleSocialLogin,
  loginUser,
  verifyUsername,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmail,
};
