import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";

import Field from "components/Field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";

// Validation schema for menu item
const ADD_ITEM_SCHEMA = object().shape({
  itemName: string().required("Item name is required"),
  description: string().optional(),
  itemPrice: string().required("Price is required"),
  itemType: string().required("Item type is required"),
  foodGroup: string().required("Food group is required"),
});

const CLASS_INPUT =
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent ";

const defaultValues = {
  itemName: "",
  description: "",
  itemPrice: 0,
  itemType: "",
  foodGroup: "",
};

const MenuItemAddDialog = ({
  open,
  onClose,
  onAddItem,
  itemType,
  foodGroup,
}) => {
  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(ADD_ITEM_SCHEMA),
  });

  const onSubmit = (data) => {
    onAddItem(data, reset);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-lg">
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
          <DialogDescription>
            Add your menu item details below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field
            label="Name"
            placeholder="Enter item name"
            classInput={CLASS_INPUT}
            error={errors.itemName?.message}
            {...register("itemName")}
          />
          <Field
            textarea
            label="Description"
            placeholder="Enter item description"
            autoComplete="off"
            error={errors.description?.message}
            classInput={CLASS_INPUT}
            {...register("description")}
          />
          <Field
            type="number"
            label="Price"
            min={0}
            step={0.01}
            placeholder="Enter item price"
            classInput={CLASS_INPUT}
            error={errors.itemPrice?.message}
            {...register("itemPrice")}
          />
          <Controller
            name="itemType"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <p className="flex mb-2 font-semibold base2">Item Type</p>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={CLASS_INPUT}>
                    <SelectValue placeholder="Select Item Type " />
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
                <p className="flex font-semibold base2">Food Group</p>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={CLASS_INPUT}>
                    <SelectValue placeholder="Select Food Group" />
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
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemAddDialog;
