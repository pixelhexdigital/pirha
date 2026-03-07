import { twMerge } from "tailwind-merge";

const FOOD_GROUP_BG_COLORS = {
  veg: "bg-green-500",
  "non-veg": "bg-red-500",
  egg: "bg-yellow-500",
  vegan: "bg-blue-500",
};

const FOOD_GROUP_BORDER_COLORS = {
  veg: "border-green-500",
  "non-veg": "border-red-500",
  egg: "border-yellow-500",
  vegan: "border-blue-500",
};

const FoodGroupIndicator = ({ foodGroup, className }) => {
  const group = foodGroup?.toLowerCase();
  return (
    <div
      className={twMerge(
        "border p-[2px] w-fit",
        FOOD_GROUP_BORDER_COLORS[group],
        className
      )}
    >
      <div
        className={twMerge(
          "size-2.5 rounded-full",
          FOOD_GROUP_BG_COLORS[group]
        )}
      />
    </div>
  );
};

export { FOOD_GROUP_BG_COLORS, FOOD_GROUP_BORDER_COLORS };
export default FoodGroupIndicator;
