import moment from "moment";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { object, string, number } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import imageCompression from "browser-image-compression";
import { Upload } from "lucide-react";

import { useUpdateLogoMutation, useUpdateProfileMutation } from "api/adminApi";
import { useCurrentUserQuery } from "api/userApi";

import Field from "components/Field";
import { Button } from "components/ui/button";
import { errorToast } from "lib/helper";
import { Combobox } from "components/ui/Combobox";
import Spinner, { ButtonSpinner } from "components/Spinner";

// Input class styles

// Default form values
const DEFAULT_VALUES = {
  restroName: "",
  ownerFullName: "",
  location: "",
  restroType: "",
  yearOfEstablishment: "",
};

// Error messages
const ERROR_MESSAGES = {
  RESTRO_NAME_REQUIRED: "Restaurant name is required",
  OWNER_NAME_REQUIRED: "Owner's name is required",
  LOCATION_REQUIRED: "Location is required",
  RESTRO_TYPE_REQUIRED: "Restaurant type is required",
  YEAR_REQUIRED: "Year of establishment is required",
  YEAR_NUMBER: "Year of establishment must be a number",
};

// Yup schema for form validation
const UPDATE_PROFILE_FORM_SCHEMA = object().shape({
  restroName: string().required(ERROR_MESSAGES.RESTRO_NAME_REQUIRED),
  ownerFullName: string().required(ERROR_MESSAGES.OWNER_NAME_REQUIRED),
  location: string().required(ERROR_MESSAGES.LOCATION_REQUIRED),
  restroType: string().required(ERROR_MESSAGES.RESTRO_TYPE_REQUIRED),
  yearOfEstablishment: number()
    .required(ERROR_MESSAGES.YEAR_REQUIRED)
    .typeError(ERROR_MESSAGES.YEAR_NUMBER),
});

const RESTRO_TYPES = [
  { label: "Fast Food", value: "Fast food" },
  { label: "Fine Dining", value: "Fine dining" },
  { label: "Casual Dining", value: "Casual dining" },
  { label: "Cafe", value: "Cafe" },
  { label: "Bar", value: "Bar" },
  { label: "Pub", value: "Pub" },
  { label: "Food Truck", value: "Food truck" },
  { label: "Buffet", value: "Buffet" },
  { label: "Food Court", value: "Food court" },
  { label: "Cloud Kitchen", value: "Cloud kitchen" },
];

const UpdateProfilePage = ({ nextStep }) => {
  const [image, setImage] = useState(null);

  const [uploadImage, { isLoading: isUploading }] = useUpdateLogoMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const { data: user, isLoading: isUserLoading } = useCurrentUserQuery();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(UPDATE_PROFILE_FORM_SCHEMA),
  });

  useEffect(() => {
    if (!user) return;
    reset({
      restroName: user.restroName,
      ownerFullName: user.ownerFullName,
      location: user.location,
      restroType: user.restroType,
      yearOfEstablishment: moment(user.yearOfEstablishment).isValid()
        ? moment(user.yearOfEstablishment).format("YYYY")
        : "",
    });
    setImage(user.avatar?.url);
  }, [user, reset]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const options = {
        maxSizeMB: 1, // Max size (in MB)
        maxWidthOrHeight: 800, // Max width or height
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);

        // Generate preview
        const compressedBlob = URL.createObjectURL(compressedFile);
        setImage(compressedBlob);

        // Upload compressed file
        await uploadImageToServer(compressedFile);
      } catch (error) {
        errorToast({ error, message: "Failed to compress image" });
      }
    }
  };

  const uploadImageToServer = async (file) => {
    try {
      const response = await uploadImage(file).unwrap();
      if (response.success) {
        setImage(response.data?.avatar?.url);
      } else {
        errorToast({ message: "Image upload failed" });
      }
    } catch (error) {
      errorToast({ error, message: "Image upload failed" });
    }
  };

  const handleProfileUpdate = async (data) => {
    if (data.yearOfEstablishment) {
      // Convert the year to a full date format (January 1st of the given year)
      const year = parseInt(data.yearOfEstablishment, 10);
      const date = new Date(Date.UTC(year, 0, 1));
      data.yearOfEstablishment = date.toISOString();
    }

    try {
      const response = await updateProfile(data).unwrap();
      if (response.success) {
        nextStep();
      } else {
        errorToast({ message: "Profile update failed" });
      }
    } catch (error) {
      errorToast({ error });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[16rem]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleProfileUpdate)} className="w-full">
      <div className="flex flex-col items-center justify-center gap-3 mb-8">
        <div className="relative rounded-full transition-shadow has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2">
          <div className="flex items-center justify-center border-2 border-dashed rounded-full size-24 sm:size-32 border-muted-foreground/25 bg-muted">
            {image ? (
              <img
                src={image || "/placeholder.svg"}
                alt="Restaurant logo"
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            aria-label="Upload restaurant logo"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        {isUploading ? (
          <p role="status" aria-live="polite" className="text-sm text-info">
            Uploading…
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {image ? "Change logo" : "Add your logo"}
          </p>
        )}
      </div>
      <Field
        autoFocus
        className="mb-4"
        label="Restaurant name"
        placeholder="e.g. The Copper Spoon"
        error={errors.restroName?.message}
        {...register("restroName")}
      />
      <Field
        className="mb-4"
        label="Owner's full name"
        placeholder="e.g. Priya Sharma"
        autoComplete="name"
        error={errors.ownerFullName?.message}
        {...register("ownerFullName")}
      />
      <Field
        className="mb-4"
        label="Location"
        placeholder="City or area"
        autoComplete="off"
        error={errors.location?.message}
        {...register("location")}
      />
      <div className="mb-4">
        <Controller
          name="restroType"
          control={control}
          render={({ field }) => (
            <Combobox
              data={RESTRO_TYPES}
              value={field.value}
              setValue={(value) => field.onChange(value)}
              showSearchInput={true}
              error={errors.restroType?.message}
              label="Restaurant type"
              placeholder="Select a type"
            />
          )}
        />
      </div>
      <Field
        type="number"
        min={1900}
        max={moment().format("YYYY")}
        label="Year established"
        placeholder="e.g. 2019"
        className="mb-4"
        error={errors.yearOfEstablishment?.message}
        {...register("yearOfEstablishment")}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full mb-4"
        disabled={isUploading || isUpdating}
      >
        {isUpdating ? <ButtonSpinner /> : "Save and Continue"}
      </Button>
    </form>
  );
};

export default UpdateProfilePage;
