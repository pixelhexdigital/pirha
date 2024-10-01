import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import { Upload, Pencil } from "lucide-react";

import { Button } from "components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import Field from "components/Field";

const CLASS_INPUT =
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent ";

const DEFAULT_VALUES = {
  name: "",
  imageUrl: "",
  imageFile: null,
  isImageChanged: false,
};

const ERROR_MESSAGES = {
  NAME_REQUIRED: "Name is required",
  MUST_BE_NUMBER: "Must be a number",
};

const FORM_SCHEMA = object().shape({
  name: string().required(ERROR_MESSAGES.NAME_REQUIRED),
});

const CategoriesForm = ({
  isOpen,
  onClose,
  onSubmit,
  loader = false,
  defaultValues = DEFAULT_VALUES,
}) => {
  const imageRef = useRef(null);
  const name = defaultValues?.name ? "Edit Category" : "Add New Category";

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues,
    resolver: yupResolver(FORM_SCHEMA),
  });

  const { imageUrl } = watch();

  useEffect(() => {
    const { name, image } = defaultValues || {};
    setValue("name", name);
    setValue("imageUrl", image?.url);
    setValue("isImageChanged", false);
  }, [defaultValues, setValue]);

  useEffect(() => {
    clearErrors();
    if (!isOpen) {
      reset();
    }
  }, [isOpen, clearErrors, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setValue("imageFile", file);
    setValue("imageUrl", URL.createObjectURL(file));
    setValue("isImageChanged", true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md ">
        <DialogHeader>
          <DialogTitle>
            <p className="text-2xl font-semibold">{name}</p>
          </DialogTitle>
          <DialogDescription className="mb-4">
            {defaultValues?.name
              ? "Edit the details of the category"
              : "Fill in the details of the new category"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative mx-auto my-4 text-center size-52">
            {imageUrl ? (
              <img
                src={imageUrl || ""}
                alt="Avatar"
                className="border border-gray-300 size-[12.5rem] rounded-xl object-cover cursor-default shadow-md"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 bg-gray-200 border border-gray-300 rounded-xl size-[12.5rem] shadow-md">
                <span className="text-gray-500">Upload Image</span>
              </div>
            )}
            <input
              id="avatar"
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => imageRef.current.click()}
              className="absolute flex items-center justify-center transition-all duration-300 ease-in-out transform right-[0.60rem] bottom-2 size-10 bg-primary hover:scale-105 hover:bg-primary/90 hover:text-white rounded-br-lg rounded-tl-lg shadow-md"
            >
              {imageUrl ? (
                <Pencil size={22} color="white" />
              ) : (
                <Upload size={22} color="white" />
              )}
            </button>
          </div>
          <div className="grid gap-4">
            <Field
              label="Name of the Category"
              placeholder="Name of the Category"
              autoComplete="off"
              error={errors.name?.message}
              classInput={CLASS_INPUT}
              {...register("name")}
            />
          </div>

          <DialogFooter className="flex flex-row justify-end gap-10 mt-5">
            <Button type="submit" className="items-center min-w-24">
              {loader ? <div className="ring-loader size-6" /> : name}
            </Button>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoriesForm;
