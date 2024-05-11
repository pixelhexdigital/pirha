import { Restaurant } from "../../../models/apps/auth/restaurant.models";
import { Customer } from "../../../models/apps/manageRestaurant/customer.models";
import { ApiError } from "../../../utils/ApiError";
import { asyncHandler } from "../../../utils/asyncHandler";

const generateCustomerBill = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const customer = await Customer.findById(req.customer?._id);
  if (!customer) {
    throw new ApiError(401, "Customer not found");
  }
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(401, "Restaurant not found");
  }
});

export { generateCustomerBill };
