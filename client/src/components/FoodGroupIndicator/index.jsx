import { twMerge } from "tailwind-merge";

// Veg = green, non-veg = red is the FSSAI food-labelling convention; routing
// it through semantic tokens preserves that meaning while staying theme-aware.
const FOOD_GROUP_BG_COLORS = {
  veg: "bg-success",
  "non-veg": "bg-destructive",
  egg: "bg-warning",
  vegan: "bg-info",
};

const FOOD_GROUP_BORDER_COLORS = {
  veg: "border-success",
  "non-veg": "border-destructive",
  egg: "border-warning",
  vegan: "border-info",
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
