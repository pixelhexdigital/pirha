import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number } from "yup";
import { Upload } from "lucide-react";
import { Button } from "components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
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
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent";

const DEFAULT_VALUES = {
  title: "",
  description: "",
  price: "",
  discount: "",
  itemType: "",
  foodGroup: "",
};

const ERROR_MESSAGES = {
  TITLE_REQUIRED: "Title is required",
  DESCRIPTION_REQUIRED: "Description is required",
  PRICE_REQUIRED: "Price is required",
  DISCOUNT_REQUIRED: "Discount is required",
  ITEM_TYPE_REQUIRED: "Item type is required",
  FOOD_GROUP_REQUIRED: "Food group is required",
};

const FORM_SCHEMA = object().shape({
  title: string().required(ERROR_MESSAGES.TITLE_REQUIRED),
  description: string().required(ERROR_MESSAGES.DESCRIPTION_REQUIRED),
  price: number().required(ERROR_MESSAGES.PRICE_REQUIRED),
  discount: number().required(ERROR_MESSAGES.DISCOUNT_REQUIRED),
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
  const [image, setImage] = useState(null);

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    setValue,
    reset,
  } = useForm({
    defaultValues,
    resolver: yupResolver(FORM_SCHEMA),
  });
  //   {
  //     "title": "Rasogulla",
  //     "description": "thela lal hai",
  //     "price": 20,
  //     "itemType": "Food",
  //     "foodGroup": "Veg",
  //     "discount": 0,
  //     "isActive": true,
  //     "image": {
  //         "url": null,
  //         "public_id": null,
  //         "_id": "668598765ee50741b290b73e"
  //     },
  //     "isAvailable": true,
  //     "estimatedPrepTime": 0,
  //     "_id": "668598765ee50741b290b73f"
  // }

  useEffect(() => {
    if (!defaultValues) return;
    const { title, description, price, discount, itemType, foodGroup } =
      defaultValues;
    setValue("title", title);
    setValue("description", description);
    setValue("price", price);
    setValue("discount", discount);
    setValue("itemType", itemType);
    setValue("foodGroup", foodGroup);
    setImage(defaultValues?.image?.url);
  }, [defaultValues, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        onClose();
        if (!isOpen) reset();
      }}
    >
      <DialogContent className="max-w-md sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {defaultValues.title ? "Edit Dish" : "Add New Dish"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4 text-center">
            <label htmlFor="avatar" className="inline-block cursor-pointer">
              {image ? (
                <img
                  src={image}
                  alt="Avatar"
                  className="border border-gray-300 size-[12.5rem] rounded-xl "
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 bg-gray-200 border border-gray-300 rounded-xl size-[12.5rem]">
                  <Upload className="w-8 h-8 text-gray-500" />
                  <span className="text-gray-500">Upload Image</span>
                </div>
              )}
            </label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
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
                </div>
              )}
            />
          </div>

          <DialogFooter className="flex flex-row justify-end gap-10 mt-5">
            <Button type="submit" className="items-center min-w-24">
              {loader ? (
                <div className="ring-loader size-6" />
              ) : defaultValues?.title ? (
                "Edit Dish"
              ) : (
                "Add Dish"
              )}
            </Button>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DishForm;
