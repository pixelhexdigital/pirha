import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { object, string } from "yup";
import { useDispatch, useSelector } from "react-redux";
import { HandPlatter } from "lucide-react";

import { useCreateOrderMutation } from "api/orderApi";
import { useLoginCustomerMutation } from "api/customerApi";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "components/ui/sheet";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog";
import Field from "components/Field";
import { Button } from "components/ui/button";
import {
  addToCart,
  clearCart,
  removeFromCart,
  selectCart,
} from "store/CartSlice";
import {
  selectRestaurantDetails,
  selectTableDetailById,
} from "store/MiscellaneousSlice";
import { errorToast, successToast } from "lib/helper";

const CLASS_INPUT =
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent";

const FORM_SCHEMA = object().shape({
  userName: string().required("Name is required"),
  mobileNo: string()
    .required("Mobile No is required")
    .matches(/^[6-9]\d{9}$/, "Invalid Mobile No"),
});

const Cart = () => {
  const dispatch = useDispatch();
  const cartData = useSelector(selectCart);

  const restaurantDetails = useSelector(selectRestaurantDetails);
  const tableDetails = useSelector(selectTableDetailById);

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [loginCustomer, { isLoading: loginLoadingStatus }] =
    useLoginCustomerMutation();

  const [sheetOpen, setSheetOpen] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userName: "",
      mobileNo: "",
    },
    resolver: yupResolver(FORM_SCHEMA),
  });

  const totalItems = cartData?.reduce((acc, item) => acc + item.quantity, 0);
  const total = cartData?.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const onOpenChange = (isOpen) => setSheetOpen(isOpen);

  const handlePlaceOrder = async (data) => {
    const customerData = {
      firstName: data.userName,
      lastName: "",
      number: data.mobileNo,
      restaurantId: restaurantDetails?._id,
    };

    const orderData = {
      tableId: tableDetails?._id,
      items: cartData.map((item) => ({
        menuItemId: item._id,
        quantity: item.quantity,
      })),
    };

    try {
      await loginCustomer(customerData).unwrap();
      await createOrder({
        data: orderData,
        restaurantId: restaurantDetails?._id,
      }).unwrap();
      successToast({ message: "Order Placed Successfully" });
      dispatch(clearCart());
      setSheetOpen(false);
    } catch (error) {
      errorToast({ error: error });
    }
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={onOpenChange}>
      {cartData?.length > 0 && (
        <section className="fixed bottom-0 flex justify-between w-full p-4 bg-primary text-primary-background">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center bg-white border rounded-full size-10">
              <HandPlatter size={18} fill="black" />
            </div>
            <p className="text-white">
              <span>&#8377; </span>
              {total}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-white caption1">
              {totalItems} {totalItems > 1 ? "Items" : "Item"}
            </p>
            <SheetTrigger className="px-4 py-2 text-sm font-semibold bg-white rounded-lg text-primary-background focus:outline-none focus:ring focus:ring-primary-background focus:ring-opacity-50">
              View Order
            </SheetTrigger>
          </div>
        </section>
      )}

      <SheetContent className="w-full">
        <SheetHeader>
          <SheetTitle>Order Summary</SheetTitle>
        </SheetHeader>
        {cartData?.map((item) => (
          <article
            key={item._id}
            className="flex justify-between p-2 mt-4 border-b"
          >
            <div className="flex gap-4">
              <img
                src={item.image?.url}
                alt={item.name}
                className="w-20 h-20 rounded-lg"
              />
              <div className="font-semibold text-start">
                <p>{item.title}</p>
                <p className="text-sm opacity-70">[{item.description}]</p>
                <p>
                  <span>&#8377; </span>
                  {item.price}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <button
                    className="px-1 text-sm font-semibold text-red-700 transition-colors border border-red-700 rounded-lg bg-rose-50 hover:bg-rose-100 hover:text-rose-700 focus:outline-none focus:ring focus:ring-rose-300 focus:ring-opacity-50"
                    onClick={() => {
                      dispatch(removeFromCart({ item: item }));
                    }}
                  >
                    -
                  </button>
                  <p>{item.quantity}</p>
                  <button
                    className="px-1 text-sm font-semibold text-green-700 transition-colors border border-green-700 rounded-lg bg-lime-50 hover:bg-lime-100 hover:text-lime-700 focus:outline-none focus:ring focus:ring-lime-300 focus:ring-opacity-50"
                    onClick={() => {
                      dispatch(addToCart({ item: item }));
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              {item.quantity > 1 ? (
                <p>
                  <span>&#8377; </span>
                  {item.price * item.quantity}
                </p>
              ) : null}
            </div>
          </article>
        ))}
        <section className="flex justify-between p-2 font-bold border-t">
          <p>Grand Total</p>
          <p>
            <span>&#8377; </span>
            {total}
          </p>
        </section>
        <SheetFooter>
          <Dialog className="" area-label="Place Order">
            <DialogTrigger className="w-full px-4 py-2 mt-10 text-sm font-semibold text-white rounded-lg bg-primary focus:outline-none focus:ring focus:ring-primary-background focus:ring-opacity-50">
              Place Order
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-w-md">
              <DialogHeader>
                <DialogTitle>Place Order</DialogTitle>
                <DialogDescription>
                  Please enter your details to place the order
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Field
                  className="mb-4"
                  placeholder="Enter Your Name"
                  autoComplete="name"
                  classInput={CLASS_INPUT}
                  error={errors.userName?.message}
                  {...register("userName")}
                />
                <Field
                  className="mb-4"
                  placeholder="Enter Your Mobile No"
                  autoComplete="off"
                  classInput={CLASS_INPUT}
                  error={errors.mobileNo?.message}
                  {...register("mobileNo")}
                />
              </div>
              <DialogFooter className="flex flex-row justify-end gap-10">
                <Button
                  type="submit"
                  onClick={handleSubmit(handlePlaceOrder)}
                  disabled={isLoading || loginLoadingStatus}
                >
                  {isLoading || loginLoadingStatus
                    ? "Placing Order..."
                    : "Place Order"}
                </Button>
                <DialogClose>Cancel</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
