import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { PencilLine, SlidersVertical, Trash2 } from "lucide-react";

import CategoriesForm from "./CategoriesForm";
import Layout from "components/Layout";
import { Switch } from "components/ui/switch";
import { Skeleton } from "components/ui/skeleton";
import { Button } from "components/ui/button";
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="mb-4 h4">Menu Management</h2>
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
                <article
                  key={category._id}
                  className="w-full gap-4 pt-4 transition ease-in-out delay-150 transform scale-[0.98] border rounded-lg shadow-sm hover:shadow-md border-primary/10 hover:border-primary/20 hover:scale-100 bg-white/100 hover:-translate-y-1 duration-300"
                >
                  <div className="flex items-center justify-between px-4 pb-2 mb-4 border-b m border-primary/10">
                    <button
                      onClick={() =>
                        setDeleteCategoryData({
                          categoryId: category._id,
                          categoryName: category.name,
                        })
                      }
                    >
                      <Trash2
                        size={22}
                        color="red"
                        className="transition-all duration-300 ease-in-out transform cursor-pointer hover:scale-110 hover:text-red-500"
                      />
                    </button>
                    <Switch
                      checked={category.isActive}
                      onCheckedChange={(isActive) =>
                        updateCategoryAvailability(category._id, isActive)
                      }
                    />
                  </div>
                  <div className="flex flex-col items-center w-full">
                    <img
                      src={category.image.url}
                      alt={category.title}
                      className="rounded-md aspect-square size-44 md:size-48 lg:size-52"
                    />
                    <h3 className="mt-4 font-semibold">{category.name}</h3>
                    <Link
                      to={ROUTES.MENU_MANAGEMENT}
                      state={{ categoryIdFromState: category._id }}
                      className="font-semibold hover:underline text-primary/80"
                    >
                      No of items: {category.items.length}
                    </Link>
                    <p className="mt-2 text-primary"></p>
                  </div>
                  <button
                    onClick={() => {
                      setFormVisible(true);
                      setSelectedCategory(category);
                    }}
                    className="flex items-center justify-center w-full p-4 mt-4 text-primary/80 border-primary bg-primary/10 rounded-b-md hover:bg-primary/20 hover:text-primary/90 hover:border-primary group hover:font-semibold"
                  >
                    <PencilLine className="mr-2 transition-all size-5 group-hover:size-6" />
                    Edit Category
                  </button>
                </article>
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
