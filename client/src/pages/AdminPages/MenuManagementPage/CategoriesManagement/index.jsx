import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  LucideEdit2,
  MoreVerticalIcon,
  SlidersVertical,
  Trash2,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

import Placeholder from "assets/placeholder.svg";

import CategoriesForm from "./CategoriesForm";
import Layout from "components/Layout";
import { Skeleton } from "components/ui/skeleton";
import { Button } from "components/ui/button";
import { Card } from "components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { Badge } from "components/ui/badge";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "components/ui/alert-dialog";
import { selectRestaurantId } from "store/AuthSlice";
import {
  removeCategoryById,
  selectMenuCategoryData,
  toggleCategoryAvailability,
  updateCategoryImage,
  updateMenuCategoryById,
} from "store/MenuSlice";
import { ROUTES } from "routes/RouterConfig";
import {
  useAddMenuCategoryMutation,
  useDeleteMenuCategoryMutation,
  useGetMenuCategoryByRestaurantIdQuery,
  useToggleCategoryAvailabilityMutation,
  useUpdateImageOfCategoryMutation,
  useUpdateMenuCategoryMutation,
} from "api/menuApi";
import { errorToast, successToast } from "lib/helper";

const DEFAULT_DELETE_CATEGORY_DATA = {
  categoryId: null,
  categoryName: "",
};

const CategoriesManagementPage = () => {
  const restaurantId = useSelector(selectRestaurantId);
  const menuData = useSelector(selectMenuCategoryData);

  const [isFormVisible, setFormVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteCategoryData, setDeleteCategoryData] = useState(
    DEFAULT_DELETE_CATEGORY_DATA
  );

  const { isLoading } = useGetMenuCategoryByRestaurantIdQuery(restaurantId, {
    skip: !restaurantId || menuData?.length,
  });
  const [addItemToCategoryMutationFn, { isLoading: isAddingCategory }] =
    useAddMenuCategoryMutation();
  const [updateItemInCategoryMutationFn, { isLoading: isUpdatingCategory }] =
    useUpdateMenuCategoryMutation();
  const [toggleCategoryAvailabilityMutationFn] =
    useToggleCategoryAvailabilityMutation();
  const [
    updateCategoryImageMutationFn,
    { isLoading: isUpdatingCategoryImage },
  ] = useUpdateImageOfCategoryMutation();
  const [deleteCategoryMutationFn, { isLoading: isDeletingCategory }] =
    useDeleteMenuCategoryMutation();

  const redirectToCategoriesManagement = () => {
    navigate(ROUTES.MENU_MANAGEMENT);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const buttonLoader = Boolean(
    isAddingCategory || isUpdatingCategory || isUpdatingCategoryImage
  );

  const addCategoryToMenu = async (payload) => {
    console.log("payload", payload);
    try {
      const { data } = await addItemToCategoryMutationFn({
        name: payload.category.name,
      }).unwrap();
      console.log("data", data);

      const imagePayload = {
        ...payload,
        categoryId: data.data._id,
      };
      changeItemImage({ data: imagePayload, isAddingCategory: true });
    } catch (error) {
      console.error(error);
    }
  };

  const editCategory = async (payload) => {
    try {
      await updateItemInCategoryMutationFn(payload).unwrap();
      dispatch(updateMenuCategoryById(payload));
      console.log("payload", payload);
      changeItemImage({ data: payload, isAddingCategory: false });
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormSubmit = async (data) => {
    const payload = {
      category: { ...data },
    };

    if (selectedCategory) {
      payload.categoryId = selectedCategory._id;
      editCategory(payload);
    } else {
      addCategoryToMenu(payload);
    }
  };

  const updateCategoryAvailability = async (categoryId, isActive) => {
    try {
      const payload = { isActive, categoryId };
      await toggleCategoryAvailabilityMutationFn(payload);
      dispatch(toggleCategoryAvailability(payload));
    } catch (error) {
      console.error(error);
    }
  };

  const changeItemImage = async ({ data, isAddingCategory }) => {
    const message = isAddingCategory
      ? "Category added successfully"
      : "Category updated successfully";

    const { imageFile, isImageChanged, imageUrl } = data.category;
    if (!imageFile || !isImageChanged) {
      setFormVisible(false);
      successToast({ message });
      return;
    }
    const payload = {
      categoryId: data.categoryId,
      categoryImage: imageFile,
    };

    try {
      await updateCategoryImageMutationFn(payload);
      dispatch(updateCategoryImage({ categoryId: data.categoryId, imageUrl }));
      setFormVisible(false);
      successToast({ message });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCategory = async () => {
    try {
      const payload = {
        categoryId: deleteCategoryData.categoryId,
      };
      const { data } = await deleteCategoryMutationFn(payload);
      dispatch(removeCategoryById(payload));
      setDeleteCategoryData(DEFAULT_DELETE_CATEGORY_DATA);
      successToast({ data });
    } catch (error) {
      console.error(error);
      errorToast({ error });
    }
  };

  const onCloseDishForm = () => {
    setFormVisible(false);
    setSelectedCategory(null);
  };

  return (
    <Layout>
      <div className="flex sm:items-center justify-between p-4 border-b sm:flex-row flex-col gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Menu Items</h1>
          <p className="text-sm text-muted-foreground">
            Manage your restaurant menu items and categories
          </p>
        </div>
        <Button
          variant="outline"
          onClick={redirectToCategoriesManagement}
          className="h-9"
        >
          <SlidersVertical className="mr-3 size-4" />
          Manage Menu Items
        </Button>
      </div>
      <div className="space-y-4 w-[98%] mx-auto bg-white rounded-md shadow-md ring-1 ring-black/5">
        <div className="grid gap-4 p-4 lg:grid-cols-3 sm:grid-cols-2">
          {isLoading ? (
            [...Array(6)].map((_, index) => (
              <Skeleton key={index} className="w-full h-[350px] rounded-lg" />
            ))
          ) : (
            <>
              <button
                onClick={() => {
                  setFormVisible(true);
                  setSelectedCategory(null);
                }}
                className="flex flex-col items-center justify-center w-full p-4 transition ease-in-out delay-150 duration-300 border border-dotted rounded-lg scale-[0.98] shadow-sm border-primary hover:scale-100 hover:text-primary/90 hover:border-primary min-h-80 group"
              >
                {!isAddingCategory ? (
                  <>
                    <h3 className="text-3xl transition duration-300 delay-200 group-hover:-translate-y-1 text-primary group-hover:animate-pulse group-hover:text-primary/90 group-hover:font-semibold ">
                      +
                    </h3>
                    <h3 className="font-semibold text-primary">
                      Add New
                      <br />
                      Category
                    </h3>
                  </>
                ) : (
                  <div className="ring-loader border-primary/80" />
                )}
              </button>

              {menuData?.map((category) => (
                <Card
                  key={category._id}
                  className="overflow-hidden transition-all duration-300 ease-in-out delay-150 border rounded-lg shadow-sm hover:shadow-md border-primary/10 hover:border-primary/20 bg-white/100 hover:-translate-y-1 "
                >
                  <div className="relative aspect-video">
                    <img
                      src={category.image?.url || Placeholder}
                      alt={category.name}
                      className="w-full h-full min-h-[22rem] "
                    />
                    <div className="absolute right-2 top-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 bg-white"
                          >
                            <MoreVerticalIcon className="w-4 h-4 text-black" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setFormVisible(true);
                              setSelectedCategory(category);
                            }}
                          >
                            <LucideEdit2 className="w-4 h-4 mr-2" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateCategoryAvailability(
                                category._id,
                                !category.isActive
                              )
                            }
                          >
                            {category.isActive
                              ? "Mark as Unavailable"
                              : "Mark as Available"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              setDeleteCategoryData({
                                categoryId: category._id,
                                categoryName: category.name,
                              })
                            }
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Link
                        to={ROUTES.MENU_MANAGEMENT}
                        state={{ categoryIdFromState: category._id }}
                        className="font-semibold hover:underline text-primary/80"
                      >
                        No of items: {category.items.length}
                      </Link>
                      <Badge
                        variant={category.isActive ? "default" : "outline"}
                        className={twMerge(
                          category.isActive
                            ? "text-primary/80 border-primary bg-primary/10 hover:bg-primary/10 hover:text-primary/80 hover:border-primary group hover:font-semibold"
                            : "text-foreground"
                        )}
                      >
                        {category.isActive ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
      <CategoriesForm
        isOpen={isFormVisible}
        loader={buttonLoader}
        onSubmit={handleFormSubmit}
        defaultValues={selectedCategory}
        onClose={onCloseDishForm}
      />
      <AlertDialog
        open={deleteCategoryData.categoryId}
        onOpenChange={() => setDeleteCategoryData(DEFAULT_DELETE_CATEGORY_DATA)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">
                {deleteCategoryData.categoryName}
              </span>{" "}
              From the menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center justify-end gap-4">
            <AlertDialogCancel className="w-24 mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCategory} className="w-24">
              {isDeletingCategory ? (
                <div className="ring-loader" />
              ) : (
                "Continue"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default CategoriesManagementPage;
