import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { object, string } from "yup";

import Field from "components/Field";
import { Button } from "components/ui/button";

// Validation schema for menu item
const ADD_ITEM_SCHEMA = object().shape({
  itemName: string().required("Item name is required"),
  itemPrice: string().required("Price is required"),
  itemType: string().required("Item type is required"),
  foodGroup: string().required("Food group is required"),
});

const menuItemType = ["Food", "Alcoholic Drink", "Non-Alcoholic Drink"];
const foodGroup = ["Veg", "Non-veg", "Vegan", "Egg"];

const MenuItemAddDialog = ({ open, onClose, onAddItem }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ADD_ITEM_SCHEMA),
  });

  const onSubmit = (data) => {
    onAddItem(data);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content className="fixed inset-0 bg-white rounded-lg p-4 max-w-md mx-auto mt-20 h-fit">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Dialog.Title className="text-lg font-semibold mb-4">
              Add Menu Item
            </Dialog.Title>
            <Dialog.Description className="mb-4 text-gray-500">
              Enter details of the menu item.
            </Dialog.Description>
            <div className="mb-4">
              <Field
                type="text"
                placeholder="Item name"
                className="w-full border border-gray-300 rounded p-2"
                error={errors.itemName?.message}
                {...register("itemName")}
              />
            </div>
            <div className="mb-4">
              <Field
                type="text"
                placeholder="Price"
                className="w-full border border-gray-300 rounded p-2"
                error={errors.itemPrice?.message}
                {...register("itemPrice")}
              />
            </div>
            <div className="mb-4">
              <select
                className="w-full border border-gray-300 rounded p-2"
                {...register("itemType")}
              >
                <option value="">Select item type</option>
                {menuItemType.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.itemType && (
                <span className="text-red-500 text-sm">
                  {errors.itemType.message}
                </span>
              )}
            </div>
            <div className="mb-4">
              <select
                className="w-full border border-gray-300 rounded p-2"
                {...register("foodGroup")}
              >
                <option value="">Select food group</option>
                {foodGroup.map((group, index) => (
                  <option key={index} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              {errors.foodGroup && (
                <span className="text-red-500 text-sm">
                  {errors.foodGroup.message}
                </span>
              )}
            </div>
            <Button type="submit" size="lg" className="w-full">
              Save Item
            </Button>
          </form>
          <Dialog.Close asChild>
            <button
              className="absolute top-2 right-2 p-1 bg-transparent border-none cursor-pointer"
              aria-label="Close"
            >
              <Cross2Icon className="h-5 w-5" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default MenuItemAddDialog;
