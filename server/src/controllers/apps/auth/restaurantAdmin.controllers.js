import mongoose from "mongoose";
import { Restaurant } from "../../../models/apps/auth/restaurant.models.js";
// import { SocialFollow } from "../../../models/apps/social-media/follow.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../../utils/cloudinary.js";

/**
 *
 * @param {string} restaurantId
 * @param {import("express").Request} req
 * @description A utility function, which querys the {@link Restaurant} model and returns the profile with account details
 */
// const getUserSocialProfile = async (restaurantId, req) => {
//   const restaurant = await Restaurant.findById(restaurantId);

//   if (!restaurant) {
//     throw new ApiError(404, "Restaurant does not exist");
//   }

//   let profile = await Restaurant.aggregate([
//     {
//       $match: {
//         _id: new mongoose.Types.ObjectId(restaurantId),
//       },
//     },
//     {
//       $project: {
//         refreshToken: 0,
//         forgotPasswordToken: 0,
//         forgotPasswordExpiry: 0,
//         emailVerificationToken: 0,
//         emailVerificationExpiry: 0,
//         password: 0,
//       },
//     },
//     {
//       $lookup: {
//         from: "socialfollows",
//         localField: "_id",
//         foreignField: "followerId",
//         as: "following", // users that are followed by current restaurant
//       },
//     },
//     {
//       $lookup: {
//         from: "socialfollows",
//         localField: "_id",
//         foreignField: "followeeId",
//         as: "followedBy", // users that are following the current restaurant
//       },
//     },
//     {
//       $addFields: {
//         followersCount: { $size: "$followedBy" },
//         followingCount: { $size: "$following" },
//       },
//     },
//     {
//       $project: {
//         followedBy: 0,
//         following: 0,
//       },
//     },
//   ]);

//   let isFollowing = false;

//   if (req.restaurant?._id && req.restaurant?._id?.toString() !== restaurantId.toString()) {
//     // Check if there is a logged in restaurant and logged in restaurant is NOT same as the profile that is being loaded
//     // In such case we will check if the logged in restaurant follows the loaded profile restaurant
//     const followInstance = await SocialFollow.findOne({
//       followerId: req.restaurant?._id, // logged in restaurant. If this is null `isFollowing` will be false
//       followeeId: restaurantId,
//     });
//     isFollowing = followInstance ? true : false;
//   }

//   const userProfile = profile[0];

//   if (!userProfile) {
//     throw new ApiError(404, "Restaurant profile does not exist");
//   }
//   return { ...userProfile, isFollowing };
// };

// const getMySocialProfile = asyncHandler(async (req, res) => {
//   let profile = await getUserSocialProfile(req.restaurant._id, req);
//   return res
//     .status(200)
//     .json(new ApiResponse(200, profile, "Restaurant profile fetched successfully"));
// });

// Public route
// const getProfileByUserName = asyncHandler(async (req, res) => {
//   const { username } = req.params;

//   const restaurant = await Restaurant.findOne({
//     username: username.toLowerCase(),
//   });

//   if (!restaurant) {
//     throw new ApiError(404, "Restaurant does not exist");
//   }

//   const userProfile = await getUserSocialProfile(restaurant._id, req);

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, userProfile, "Restaurant profile fetched successfully")
//     );
// });

const updateSocialProfile = asyncHandler(async (req, res) => {
  const {
    restroName,
    ownerFullName,
    location,
    restroType,
    serviceLocation,
    yearOfEstablishment,
    socialLink,
  } = req.body;

  let profile = await Restaurant.findByIdAndUpdate(
    req.restaurant?._id,
    {
      $set: {
        restroName,
        baseURL,
        ownerFullName,
        location,
        restroType,
        serviceLocation,
        yearOfEstablishment,
        socialLink,
      },
    },
    { new: true }
  ).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  //   profile = await getUserSocialProfile(req.restaurant._id, req);

  return res
    .status(200)
    .json(
      new ApiResponse(200, profile, "Restaurant profile updated successfully")
    );
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  const restaurantId = req.restaurant?._id;

  const restaurant = await Restaurant.findById(restaurantId);
  let publicId = null;
  if (restaurant.coverImage.public_id) {
    publicId = restaurant.coverImage.public_id;
  }

  if (!coverImageLocalPath)
    throw new ApiError(400, "coverImage file is missing");
  const coverImage = await uploadOnCloudinary(coverImageLocalPath, publicId);

  if (!coverImage.url)
    throw new ApiError(400, "Error while uploading cover image");
  const updatedUser = await Restaurant.findByIdAndUpdate(
    req.restaurant?._id,
    {
      $set: {
        "coverImage.url": coverImage.url,
        "coverImage.public_id": coverImage.public_id,
      },
    },
    { new: true }
  ).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser,
        "restaurant coverImage updated successfully"
      )
    );
});

const updateAvatar = asyncHandler(async (req, res) => {
  // Check if restaurant has uploaded an avatar
  const avatarLocalPath = req.file?.path;
  const restaurantId = req.restaurant?._id;

  const restaurant = await Restaurant.findById(restaurantId);
  let publicId = null;
  if (restaurant.avatar.public_id) {
    publicId = restaurant.avatar.public_id;
  }

  if (!avatarLocalPath) throw new ApiError(400, "avatar file is missing");
  const avatar = await uploadOnCloudinary(avatarLocalPath, publicId);

  if (!avatar.url)
    throw new ApiError(400, "Error while uploading avatar image");
  const updatedUser = await Restaurant.findByIdAndUpdate(
    req.restaurant?._id,
    {
      $set: {
        "avatar.url": avatar.url,
        "avatar.public_id": avatar.public_id,
      },
    },
    { new: true }
  ).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

export { updateSocialProfile, updateCoverImage, updateAvatar };
