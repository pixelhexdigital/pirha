import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ENUMS } from "./apps/constants/enum.js";

const fetchEnum = asyncHandler(async (req, res) => {
  const enums = ENUMS;
  return res
    .status(200)
    .json(new ApiResponse(200, { enums }, "Enums fetched Succesfully"));
});

export { fetchEnum };
