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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a dish</DialogTitle>
          <DialogDescription>
            Fill in the details for this menu item.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field
            autoFocus
            label="Name"
            placeholder="e.g. Margherita Pizza"
            error={errors.itemName?.message}
            {...register("itemName")}
          />
          <Field
            textarea
            label="Description"
            placeholder="Enter item description"
            autoComplete="off"
            error={errors.description?.message}
            {...register("description")}
          />
          <Field
            type="number"
            label="Price"
            min={0}
            step={0.01}
            placeholder="Enter item price"
            error={errors.itemPrice?.message}
            {...register("itemPrice")}
          />
          <Controller
            name="itemType"
            control={control}
            render={({ field }) => (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Item type
                </p>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item type" />
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
                  <div className="mt-2 text-xs font-medium text-destructive">
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
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Food group
                </p>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select food group" />
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
                  <div className="mt-2 text-xs font-medium text-destructive">
                    {errors.foodGroup?.message}
                  </div>
                )}
              </div>
            )}
          />
          <DialogFooter>
            <Button type="submit" size="lg">
              Add item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemAddDialog;
