import moment from "moment";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { number, object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller } from "react-hook-form";
import { Upload } from "lucide-react";
import imageCompression from "browser-image-compression";

import { useUpdateLogoMutation, useUpdateProfileMutation } from "api/adminApi";
import { useCurrentUserQuery } from "api/userApi";

import Field from "components/Field";
import { Button } from "components/ui/button";
import { Combobox } from "components/ui/Combobox";
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { errorToast } from "lib/helper";
import Spinner from "components/Spinner";
import { ButtonSpinner } from "components/Spinner";

// Input class styles
const CLASS_INPUT = "";

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

// Input placeholders
const PLACEHOLDERS = {
  RESTRO_NAME: "Restaurant Name",
  OWNER_NAME: "Owner's Full Name",
  LOCATION: "Location",
  RESTRO_TYPE: "Restaurant Type",
  YEAR: "Year of Establishment",
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

const UserProfileForm = () => {
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
        console.error("Image compression error:", error);
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
      console.error("Image upload failed", error);
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
        // Reset the form with updated user data
        reset({
          restroName: response.data.restroName,
          ownerFullName: response.data.ownerFullName,
          location: response.data.location,
          restroType: response.data.restroType,
          yearOfEstablishment: moment(
            response.data.yearOfEstablishment
          ).isValid()
            ? moment(response.data.yearOfEstablishment).format("YYYY")
            : "",
        });
        setImage(response.data.avatar?.url);
      } else {
        errorToast({ message: "Profile update failed" });
      }
    } catch (error) {
      errorToast({ error });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restaurant Profile</CardTitle>
        <CardDescription>
          Update your restaurant profile information to keep it current and
          accurate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(handleProfileUpdate)}
          className="w-full mx-auto"
        >
          <div className="flex flex-col items-center justify-center gap-4 mb-8">
            <div className="relative group cursor-pointer">
              <Avatar className="size-32 border-2 border-dashed border-muted-foreground/25 group-hover:border-primary/50 transition-colors">
                <AvatarImage
                  src={image}
                  alt="Restaurant logo"
                  className="object-contain"
                />
                <AvatarFallback className="bg-muted">
                  <Upload className="size-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="size-6 text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {isUploading && (
              <p className="text-sm text-info">Uploading...</p>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Field
              placeholder={PLACEHOLDERS.RESTRO_NAME}
              label={PLACEHOLDERS.RESTRO_NAME}
              classInput={CLASS_INPUT}
              error={errors.restroName?.message}
              {...register("restroName")}
            />
            <Field
              placeholder={PLACEHOLDERS.OWNER_NAME}
              label={PLACEHOLDERS.OWNER_NAME}
              autoComplete="off"
              classInput={CLASS_INPUT}
              error={errors.ownerFullName?.message}
              {...register("ownerFullName")}
            />
            <Field
              label={PLACEHOLDERS.LOCATION}
              placeholder={PLACEHOLDERS.LOCATION}
              autoComplete="off"
              classInput={CLASS_INPUT}
              error={errors.location?.message}
              {...register("location")}
            />
            <div>
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
                    label={PLACEHOLDERS.RESTRO_TYPE}
                    placeholder={PLACEHOLDERS.RESTRO_TYPE}
                    buttonClassName={CLASS_INPUT}
                  />
                )}
              />
            </div>
            <Field
              type="number"
              min={1900}
              max={moment().format("YYYY")}
              label={PLACEHOLDERS.YEAR}
              placeholder={PLACEHOLDERS.YEAR}
              classInput={CLASS_INPUT}
              error={errors.yearOfEstablishment?.message}
              {...register("yearOfEstablishment")}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-36 mb-4  mt-8"
            disabled={isUploading}
          >
            {isUpdating ? <ButtonSpinner /> : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;
