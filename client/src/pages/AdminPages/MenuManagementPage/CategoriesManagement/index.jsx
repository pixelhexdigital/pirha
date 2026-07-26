import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FolderPlus, Plus, SlidersVertical } from "lucide-react";

import CategoriesForm from "./CategoriesForm";
import MenuManagementCard from "../MenuManagementCard";
import Layout from "components/Layout";
import PageHeader from "components/PageHeader";
import EmptyState from "components/EmptyState";
import { ButtonSpinner } from "components/Spinner";
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
  const navigate = useNavigate();

  const [isFormVisible, setFormVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pendingCategoryId, setPendingCategoryId] = useState(null);
  const [deleteCategoryData, setDeleteCategoryData] = useState(
    DEFAULT_DELETE_CATEGORY_DATA
  );

  // Single source of truth: categories come straight from the query cache.
  const { data, isLoading } = useGetMenuCategoryByRestaurantIdQuery(
    restaurantId,
    { skip: !restaurantId }
  );
  const categories = data?.menu?.categories ?? [];

  const [addCategoryMutationFn, { isLoading: isAddingCategory }] =
    useAddMenuCategoryMutation();
  const [updateCategoryMutationFn, { isLoading: isUpdatingCategory }] =
    useUpdateMenuCategoryMutation();
  const [toggleCategoryMutationFn] = useToggleCategoryAvailabilityMutation();
  const [updateCategoryImageMutationFn, { isLoading: isUpdatingCategoryImage }] =
    useUpdateImageOfCategoryMutation();
  const [deleteCategoryMutationFn, { isLoading: isDeletingCategory }] =
    useDeleteMenuCategoryMutation();

  const buttonLoader = Boolean(
    isAddingCategory || isUpdatingCategory || isUpdatingCategoryImage
  );

  const navigateToItems = () => navigate(ROUTES.MENU_MANAGEMENT);

  const openAddCategory = () => {
    setSelectedCategory(null);
    setFormVisible(true);
  };

  const createCategory = async (payload) => {
    try {
      // The server returns the created category directly as `data`.
      const { data: newCategory } = await addCategoryMutationFn({
        name: payload.category.name,
      }).unwrap();

      const imagePayload = { ...payload, categoryId: newCategory._id };
      await changeCategoryImage({ data: imagePayload, isAdding: true });
    } catch (error) {
      errorToast({ error, message: "Failed to add category" });
    }
  };

  const editCategory = async (payload) => {
    try {
      await updateCategoryMutationFn(payload).unwrap();
      await changeCategoryImage({ data: payload, isAdding: false });
    } catch (error) {
      errorToast({ error, message: "Failed to update category" });
    }
  };

  const handleFormSubmit = async (formData) => {
    const payload = { category: { ...formData } };

    if (selectedCategory) {
      payload.categoryId = selectedCategory._id;
      editCategory(payload);
    } else {
      createCategory(payload);
    }
  };

  const handleToggleCategory = async (category, nextActive) => {
    setPendingCategoryId(category._id);
    try {
      await toggleCategoryMutationFn({
        categoryId: category._id,
        isActive: nextActive,
        restaurantId,
      }).unwrap();
    } catch (error) {
      errorToast({ error, message: "Failed to update availability" });
    } finally {
      setPendingCategoryId(null);
    }
  };

  const changeCategoryImage = async ({ data: payloadData, isAdding }) => {
    const message = isAdding ? "Category added" : "Category updated";
    const { imageFile, isImageChanged } = payloadData.category;

    if (!imageFile || !isImageChanged) {
      setFormVisible(false);
      successToast({ message });
      return;
    }

    try {
      await updateCategoryImageMutationFn({
        categoryId: payloadData.categoryId,
        categoryImage: imageFile,
      }).unwrap();
      setFormVisible(false);
      successToast({ message });
    } catch (error) {
      errorToast({ error, message: "Failed to update category image" });
    }
  };

  const deleteCategory = async () => {
    try {
      await deleteCategoryMutationFn({
        categoryId: deleteCategoryData.categoryId,
      }).unwrap();
      setDeleteCategoryData(DEFAULT_DELETE_CATEGORY_DATA);
      successToast({ message: "Category deleted" });
    } catch (error) {
      errorToast({ error, message: "Failed to delete category" });
    }
  };

  const onCloseForm = () => {
    setFormVisible(false);
    setSelectedCategory(null);
  };

  const noCategories = !isLoading && categories.length === 0;

  return (
    <Layout>
      <PageHeader
        title="Categories"
        description="Organize your menu into categories"
      >
        <Button variant="outline" onClick={navigateToItems} className="h-9">
          <SlidersVertical className="mr-3 size-4" />
          Manage Menu Items
        </Button>
        <Button onClick={openAddCategory} className="h-9">
          {isAddingCategory ? (
            <ButtonSpinner />
          ) : (
            <>
              <Plus className="mr-2 size-4" />
              Add category
            </>
          )}
        </Button>
      </PageHeader>

      {noCategories ? (
        <div className="mx-auto w-[98%]">
          <EmptyState
            icon={FolderPlus}
            title="No categories yet"
            description="Categories group your dishes — think Starters, Mains, Desserts. Create your first one to start building the menu."
          >
            <Button onClick={openAddCategory}>Add your first category</Button>
          </EmptyState>
        </div>
      ) : (
        <div className="mx-auto w-[98%] space-y-4 rounded-md bg-card shadow-md ring-1 ring-border">
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? [...Array(6)].map((_, index) => (
                  <Skeleton key={index} className="h-[320px] w-full rounded-lg" />
                ))
              : categories.map((category) => (
                  <MenuManagementCard
                    key={category?._id}
                    imageUrl={category?.image?.url}
                    title={category?.name}
                    footerLeft={
                      <Link
                        to={ROUTES.MENU_MANAGEMENT}
                        state={{ categoryIdFromState: category?._id }}
                        className="font-medium text-primary hover:underline"
                      >
                        {category?.items?.length ?? 0} items
                      </Link>
                    }
                    isActive={category?.isActive}
                    isToggling={pendingCategoryId === category?._id}
                    onToggleAvailability={(next) =>
                      handleToggleCategory(category, next)
                    }
                    onEdit={() => {
                      setSelectedCategory(category);
                      setFormVisible(true);
                    }}
                    onDelete={() =>
                      setDeleteCategoryData({
                        categoryId: category?._id,
                        categoryName: category?.name,
                      })
                    }
                    editLabel="Edit category"
                    deleteLabel="Delete category"
                  />
                ))}
          </div>
        </div>
      )}

      <CategoriesForm
        isOpen={isFormVisible}
        loader={buttonLoader}
        onSubmit={handleFormSubmit}
        defaultValues={selectedCategory}
        onClose={onCloseForm}
      />

      <AlertDialog
        open={Boolean(deleteCategoryData.categoryId)}
        onOpenChange={() => setDeleteCategoryData(DEFAULT_DELETE_CATEGORY_DATA)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">
                {deleteCategoryData.categoryName}
              </span>{" "}
              from the menu. Categories that still contain items can&apos;t be
              deleted &mdash; remove the items first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center justify-end gap-4">
            <AlertDialogCancel className="mt-0 w-24">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCategory} className="w-24">
              {isDeletingCategory ? <ButtonSpinner /> : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default CategoriesManagementPage;
