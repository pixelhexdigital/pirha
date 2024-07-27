import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number } from "yup";
import { Upload, Pencil } from "lucide-react";

import { Button } from "components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import Field from "components/Field";

const CLASS_INPUT =
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent ";

const DEFAULT_VALUES = {
  title: "",
  description: "",
  price: 0,
  discount: 0,
  itemType: "",
  foodGroup: "",
  imageUrl: "",
  imageFile: null,
  isImageChanged: false,
};

const ERROR_MESSAGES = {
  TITLE_REQUIRED: "Title is required",
  DESCRIPTION_REQUIRED: "Description is required",
  PRICE_REQUIRED: "Price is required",
  DISCOUNT_REQUIRED: "Discount is required",
  ITEM_TYPE_REQUIRED: "Item type is required",
  MUST_BE_NUMBER: "Must be a number",
  FOOD_GROUP_REQUIRED: "Food group is required",
};

const FORM_SCHEMA = object().shape({
  title: string().required(ERROR_MESSAGES.TITLE_REQUIRED),
  description: string(),
  price: number()
    .required(ERROR_MESSAGES.PRICE_REQUIRED)
    .typeError(ERROR_MESSAGES.MUST_BE_NUMBER),
  // discount: number().typeError(ERROR_MESSAGES.MUST_BE_NUMBER),
  itemType: string().required(ERROR_MESSAGES.ITEM_TYPE_REQUIRED),
  foodGroup: string().required(ERROR_MESSAGES.FOOD_GROUP_REQUIRED),
});

const DishForm = ({
  isOpen,
  onClose,
  onSubmit,
  itemType,
  foodGroup,
  loader = false,
  defaultValues = DEFAULT_VALUES,
}) => {
  const imageRef = useRef(null);
  const title = defaultValues?.title ? "Edit Dish" : "Add New Dish";

  const {
    handleSubmit,
    register,
    control,
    setValue,
    watch,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(FORM_SCHEMA),
  });

  const { imageUrl } = watch();

  useEffect(() => {
    const { title, description, price, discount, itemType, foodGroup, image } =
      defaultValues || {};
    setValue("title", title);
    setValue("description", description);
    setValue("price", price);
    setValue("discount", discount);
    setValue("itemType", itemType);
    setValue("foodGroup", foodGroup);
    setValue("imageUrl", image?.url);
    setValue("isImageChanged", false);
  }, [defaultValues, setValue]);

  useEffect(() => {
    clearErrors();
    if (!isOpen) {
      reset();
    }
  }, [isOpen, clearErrors, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setValue("imageFile", file);
    setValue("imageUrl", URL.createObjectURL(file));
    setValue("isImageChanged", true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            <p className="text-2xl font-semibold">{title}</p>
          </DialogTitle>
          <DialogDescription className="mb-4">
            {defaultValues?.title
              ? "Edit the details of the dish"
              : "Fill in the details of the new dish"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative mx-auto mb-4 text-center size-52">
            {imageUrl ? (
              <img
                src={imageUrl || ""}
                alt="Avatar"
                className="border border-gray-300 size-[12.5rem] rounded-xl object-cover cursor-default shadow-md"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 bg-gray-200 border border-gray-300 rounded-xl size-[12.5rem] shadow-md">
                <span className="text-gray-500">Upload Image</span>
              </div>
            )}
            <input
              id="avatar"
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => imageRef.current.click()}
              className="absolute flex items-center justify-center transition-all duration-300 ease-in-out transform right-[0.60rem] bottom-2 size-10 bg-primary hover:scale-105 hover:bg-primary/90 hover:text-white rounded-br-lg rounded-tl-lg shadow-md"
            >
              {imageUrl ? (
                <Pencil size={22} color="white" />
              ) : (
                <Upload size={22} color="white" />
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Name of the dish"
              placeholder="Name of the dish"
              autoComplete="off"
              error={errors.title?.message}
              classInput={CLASS_INPUT}
              {...register("title")}
            />
            <Field
              label="Description"
              placeholder="Description"
              autoComplete="off"
              error={errors.description?.message}
              classInput={CLASS_INPUT}
              {...register("description")}
            />
            <Field
              label="Price"
              placeholder="Price"
              type="number"
              autoComplete="off"
              error={errors.price?.message}
              classInput={CLASS_INPUT}
              {...register("price")}
            />
            <Field
              label="Discount"
              placeholder="Discount"
              type="number"
              autoComplete="off"
              error={errors.discount?.message}
              classInput={CLASS_INPUT}
              {...register("discount")}
            />

            <Controller
              name="itemType"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="flex font-semibold base2">Item Type</div>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className={CLASS_INPUT}>
                      <SelectValue placeholder="Item Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemType.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.itemType?.message && (
                    <div className="mt-2 text-red-600 caption1">
                      {errors.itemType?.message}
                    </div>
                  )}
                </div>
              )}
            />

            <Controller
              name="foodGroup"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="flex font-semibold base2">Food Group</div>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className={CLASS_INPUT}>
                      <SelectValue placeholder="Food Group" />
                    </SelectTrigger>
                    <SelectContent>
                      {foodGroup.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.foodGroup?.message && (
                    <div className="mt-2 text-red-600 caption1">
                      {errors.foodGroup?.message}
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          <DialogFooter className="flex flex-row justify-end gap-10 mt-5">
            <Button type="submit" className="items-center min-w-24">
              {loader ? <div className="ring-loader size-6" /> : title}
            </Button>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DishForm;
