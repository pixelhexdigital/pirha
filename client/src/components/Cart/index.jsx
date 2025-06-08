import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { object, string } from "yup";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingBag, X, Plus, Minus } from "lucide-react";

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
  clearCart,
  removeFromCart,
  selectCart,
  increaseQuantity,
  decreaseQuantity,
} from "store/CartSlice";
import {
  selectRestaurantDetails,
  selectTableDetailById,
} from "store/MiscellaneousSlice";
import { errorToast, successToast, numberToCurrency } from "lib/helper";

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
    reset,
  } = useForm({
    defaultValues: {
      userName: "",
      mobileNo: "",
    },
    resolver: yupResolver(FORM_SCHEMA),
  });

  const totalItems =
    cartData?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const subtotal =
    cartData?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  // const tax = subtotal * 0.05; // 5% tax
  const total = subtotal;

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
      reset();
    } catch (error) {
      errorToast({ error: error });
    }
  };

  if (cartData?.length === 0) return null;

  return (
    <Sheet open={sheetOpen} onOpenChange={onOpenChange}>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-background to-transparent h-24 pointer-events-none" />

      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-between items-center p-4 bg-primary text-primary-foreground shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-white rounded-full w-10 h-10">
            <ShoppingBag size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-white">
              {numberToCurrency(total, "INR", 0)}
            </p>
            <p className="text-xs text-white">
              {totalItems} {totalItems > 1 ? "Items" : "Item"}
            </p>
          </div>
        </div>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="font-medium text-secondary bg-white "
          >
            View Order
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-xl">Your Order</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-2 bg-muted/50">
            <p className="text-sm font-medium text-muted-foreground capitalize">
              Table {tableDetails?.title || "N/A"} •{" "}
              {restaurantDetails?.restroName || "Restaurant"}
            </p>
          </div>

          <div className="divide-y">
            {cartData?.map((item) => (
              <div key={item._id} className="flex items-start gap-4 p-4">
                <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                  {item.image?.url ? (
                    <img
                      src={item.image.url || "/placeholder.svg"}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium truncate">{item.title}</h3>
                    <p className="font-semibold ml-2">
                      {numberToCurrency(item.price * item.quantity, "INR", 0)}
                    </p>
                  </div>

                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => dispatch(decreaseQuantity({ item }))}
                      >
                        <Minus className="h-3 w-3" />
                        <span className="sr-only">Decrease quantity</span>
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => dispatch(increaseQuantity({ item }))}
                      >
                        <Plus className="h-3 w-3" />
                        <span className="sr-only">Increase quantity</span>
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive/90"
                      onClick={() => {
                        // Remove all quantities of this item
                        for (let i = 0; i < item.quantity; i++) {
                          dispatch(removeFromCart({ item }));
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t p-6">
          <div className="flex justify-between font-medium">
            <p>Total</p>
            <p>{numberToCurrency(total, "INR", 0)}</p>
          </div>

          <SheetFooter className="mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Place Order</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Complete Your Order</DialogTitle>
                  <DialogDescription>
                    Please provide your details to place the order
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <Field
                    placeholder="Enter Your Name"
                    autoComplete="name"
                    classInput={CLASS_INPUT}
                    error={errors.userName?.message}
                    {...register("userName")}
                  />
                  <Field
                    placeholder="Enter Your Mobile No"
                    autoComplete="tel"
                    classInput={CLASS_INPUT}
                    error={errors.mobileNo?.message}
                    {...register("mobileNo")}
                  />
                </div>

                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    onClick={handleSubmit(handlePlaceOrder)}
                    disabled={isLoading || loginLoadingStatus}
                  >
                    {isLoading || loginLoadingStatus
                      ? "Processing..."
                      : "Confirm Order"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
