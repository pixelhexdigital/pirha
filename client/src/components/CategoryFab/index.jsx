import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, X, Utensils, Coffee, Pizza, Cake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { selectRestaurantDetails } from "store/MiscellaneousSlice";
import { selectMenuCategoryData } from "store/MenuSlice";

const CategoryFab = () => {
  const navigate = useNavigate();
  const categories = useSelector(selectMenuCategoryData);
  const { tableId, restaurantId, categoryName } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const restaurantDetails = useSelector(selectRestaurantDetails);

  // const { data: categories } = useGetCategoriesQuery(
  //   { restaurantId: restaurantId || restaurantDetails?._id },
  //   { skip: !restaurantId && !restaurantDetails?._id }

  console.log("categories", categories);
  // );

  // Category icons mapping
  const categoryIcons = {
    Starter: <Utensils className="h-4 w-4" />,
    "Main Course": <Pizza className="h-4 w-4" />,
    Dessert: <Cake className="h-4 w-4" />,
    Beverages: <Coffee className="h-4 w-4" />,
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleCategoryClick = (category) => {
    navigate(
      `/menu/${tableId}/${restaurantId || restaurantDetails?._id}/${category.name}`,
      {
        state: { items: category.items },
      }
    );
    setIsOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".category-fab")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  // Don't show on categories page
  if (!categoryName) return null;

  return (
    <div className="category-fab fixed left-6 bottom-20 z-50">
      <div className="flex flex-col items-start space-y-2">
        {isOpen &&
          categories?.map((category) => (
            <Button
              key={category._id}
              size="sm"
              variant="secondary"
              className={`shadow-md transition-all ${category.name === categoryName ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
              onClick={() => handleCategoryClick(category)}
            >
              {categoryIcons[category.name] || (
                <Utensils className="mr-2 h-4 w-4" />
              )}
              <span className="ml-2">{category.name}</span>
            </Button>
          ))}

        <Button
          size="icon"
          className="rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          onClick={toggleMenu}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
        </Button>
      </div>
    </div>
  );
};

export default CategoryFab;
