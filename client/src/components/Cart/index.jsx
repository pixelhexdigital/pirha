import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { object, string } from "yup";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "components/ui/alert-dialog";
import { HandPlatter } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  clearCart,
  removeFromCart,
  selectCart,
} from "store/CartSlice";
import Field from "components/Field";

const CLASS_INPUT =
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent";
const FORM_SCHEMA = object().shape({
  userName: string().required("Name is required"),
  mobileNo: string()
    .required("Mobile No is required")
    .matches(/^[6-9]\d{9}$/, "Invalid Mobile No"),
});

const Cart = () => {
  const cartData = useSelector(selectCart);

  const dispatch = useDispatch();
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

  const total = cartData.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const totalItems = cartData.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Sheet>
      {cartData.length > 0 && (
        <div className="fixed bottom-0 flex w-full justify-between p-4 bg-[#fdb838] text-primary-background">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center bg-white border rounded-full size-10">
              <HandPlatter size={18} fill="black" />
            </div>
            <p>
              <span>&#8377; </span>
              {total}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="caption1">
              {totalItems} {totalItems > 1 ? "Items" : "Item"}
            </p>
            <SheetTrigger className="px-4 py-2 text-sm font-semibold bg-white rounded-lg text-primary-background focus:outline-none focus:ring focus:ring-primary-background focus:ring-opacity-50">
              View Order
            </SheetTrigger>
          </div>
        </div>
      )}

      <SheetContent className="w-full">
        <SheetHeader>
          <SheetTitle>Order Summary</SheetTitle>
        </SheetHeader>
        {cartData.map((item) => (
          <div key={item._id} className="flex justify-between p-2 border-b">
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
          </div>
        ))}
        <div className="flex justify-between p-2 border-t">
          <p className="font-semibold">Total</p>
          <p className="font-semibold">
            <span>&#8377; </span>
            {total}
          </p>
        </div>

        <div className="flex justify-between p-2 border-t">
          <p className="font-semibold">Taxes</p>
          <p className="font-semibold">
            <span>&#8377; </span>
            50
          </p>
        </div>

        <div className="flex justify-between p-2 border-t">
          <p className="font-semibold">Discount</p>
          <p className="font-semibold">
            <span>&#8377; </span>0
          </p>
        </div>

        <div className="flex justify-between p-2 border-t">
          <p className="font-bold">Grand Total</p>
          <p className="font-bold">
            <span>&#8377; </span>
            {total + 50}
          </p>
        </div>
        <SheetFooter>
          <AlertDialog>
            <AlertDialogTrigger className="px-4 py-2 text-sm font-semibold text-black rounded-lg bg-[#fdb838] focus:outline-none focus:ring focus:ring-primary-background focus:ring-opacity-50 w-full mt-10">
              Place Order
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Enter Your Details to Place Order
                </AlertDialogTitle>
              </AlertDialogHeader>
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

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    handleSubmit((data) => {
                      console.log(data);
                      // dispatch(clearCart());
                    })();
                  }}
                >
                  Confirm Order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
