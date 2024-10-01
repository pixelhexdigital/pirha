import { toast } from "react-hot-toast";
// import { logout } from "store/AuthSlice";

// import { logout } from "store/AuthSlice";

export const successToast = ({ data, message }) => {
  toast.success(data?.message || message);
};

export const errorToast = ({
  dispatch,
  error,
  message,
  duration = 3000,
  style = {},
}) => {
  // console.error("error", error);

  // if user is not authenticated then logout the user and redirect to login page
  if (error?.response?.status === 401 && dispatch) {
    toast.error("You have been logged out. Please login again.");
    setTimeout(() => {
      // dispatch(logout());
    }, 1000);
    return;
  }

  // if user's subscription has expired then redirect to subscription page
  // if (error?.response?.status === 402) {
  //   setTimeout(() => {
  //     window.location.href = "/subscription";
  //   }, 500);

  //   return;
  // }

  toast.error(
    error?.data?.message ||
      message ||
      "Something went wrong, please try again later.",
    { duration: duration, style: { ...style } }
  );
};

export const isObjectEmpty = (obj) => {
  // Check if the variable is an object and not null or undefined
  return (
    typeof obj === "object" &&
    obj?.constructor === Object &&
    Object.keys(obj).length === 0
  );
};

// Groups an array of objects by a specified key.
export const groupBy = (items = [], key = "") => {
  // Validate parameters
  if (!Array.isArray(items) || typeof key !== "string") {
    // throw new Error("Invalid parameters. Please provide an array and a key.");
    return {};
  }

  // Use reduce to iterate over the array and construct the grouped object
  return items.reduce((groupedItems, currentItem) => {
    // Extract the value of the specified key from the current object
    const keyValue = currentItem[key];

    // Construct a new object with the existing properties and the updated array
    return {
      ...groupedItems,
      [keyValue]: [...(groupedItems[keyValue] || []), currentItem],
    };
  }, {});
};

// Format number to currency format
export const numberToCurrency = (
  number,
  currency = "INR",
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
) => {
  // check if the number is a valid number
  if (isNaN(number) || !number) {
    return new Intl.NumberFormat("en-IN", {
      currency: currency,
      style: "currency",
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits,
    }).format(0);
  }
  return new Intl.NumberFormat("en-IN", {
    currency: currency,
    style: "currency",
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: maximumFractionDigits,
  }).format(number);
};
