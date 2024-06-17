import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { Order } from "../../../models/apps/manageRestaurant/order.models.js";

const updateOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, paymentStatus, paymentMethod } = req.body;
  const restaurantId = req.restaurant?._id;
  const order = await Order.findById(orderId);
  if (!order.restaurantId.equals(restaurantId)) {
    console.log("order.restaurantId ===>", order.restaurantId);
    console.log("restaurantId ===>", restaurantId);
    throw new ApiError(401, "Unauthorised");
  }

  let updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        status,
        paymentStatus,
        paymentMethod,
      },
    },
    { new: true }
  );

  //   profile = await getUserSocialProfile(req.restaurant._id, req);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedOrder, "Order details updated successfully")
    );
});

export { updateOrder };
