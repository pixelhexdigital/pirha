import moment from "moment";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { object, string, number } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { useUpdateLogoMutation, useUpdateProfileMutation } from "api/adminApi";
import { useCurrentUserQuery } from "api/authApi";

import Field from "components/Field";
import { Button } from "components/ui/button";
import { errorToast } from "lib/helper";
import { Combobox } from "components/ui/Combobox";

// Input class styles
const CLASS_INPUT =
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent";

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

const UpdateProfilePage = ({ nextStep }) => {
  const [image, setImage] = useState(null);
  const [imageUploaded, setImageUploaded] = useState(false);

  const [uploadImage, { isLoading: isUploading }] = useUpdateLogoMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const { data: user, isLoading: isUserLoading } = useCurrentUserQuery();

  const {
    setValue,
    handleSubmit,
    register,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(UPDATE_PROFILE_FORM_SCHEMA),
  });

  useEffect(() => {
    if (!user) return;
    setValue("restroName", user.restroName);
    setValue("ownerFullName", user.ownerFullName);
    setValue("location", user.location);
    setValue("restroType", user.restroType);
    setValue(
      "yearOfEstablishment",
      moment(user.yearOfEstablishment).isValid()
        ? moment(user.yearOfEstablishment).format("YYYY")
        : ""
    );
    setImage(user.avatar?.url);
  }, [user, setValue]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;
    try {
      const response = await uploadImage(file).unwrap();
      if (response.success) {
        setImageUploaded(true);
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
      console.log("Response:", response);
      if (response.success) {
        nextStep();
      } else {
        console.error("Profile update failed:", response);
        errorToast({ message: "Profile update failed" });
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      errorToast({ error });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleProfileUpdate)}
      className="w-full max-w-xl px-4 mx-auto"
    >
      <div className="mb-4 text-center">
        <label htmlFor="avatar" className="inline-block cursor-pointer">
          {image ? (
            <img
              src={image}
              alt="Avatar"
              className="object-cover w-24 h-24 border border-gray-300 rounded-full"
            />
          ) : (
            <div className="flex items-center justify-center w-24 h-24 bg-gray-200 border border-gray-300 rounded-full">
              <span className="text-gray-500">Upload Image</span>
            </div>
          )}
        </label>
        <input
          id="avatar"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        {isUploading && <p className="text-sm text-blue-500">Uploading...</p>}
      </div>
      <Field
        className="mb-4"
        placeholder={PLACEHOLDERS.RESTRO_NAME}
        label={PLACEHOLDERS.RESTRO_NAME}
        classInput={CLASS_INPUT}
        error={errors.restroName?.message}
        {...register("restroName")}
      />
      <Field
        className="mb-4"
        placeholder={PLACEHOLDERS.OWNER_NAME}
        label={PLACEHOLDERS.OWNER_NAME}
        autoComplete="off"
        classInput={CLASS_INPUT}
        error={errors.ownerFullName?.message}
        {...register("ownerFullName")}
      />
      <Field
        className="mb-4"
        label={PLACEHOLDERS.LOCATION}
        placeholder={PLACEHOLDERS.LOCATION}
        autoComplete="off"
        classInput={CLASS_INPUT}
        error={errors.location?.message}
        {...register("location")}
      />
      <Controller
        name="restroType"
        control={control}
        render={({ field }) => (
          <Combobox
            data={RESTRO_TYPES}
            value={field.value}
            setValue={(value) => field.onChange(value)}
            error={errors.restroType?.message}
            label={PLACEHOLDERS.RESTRO_TYPE}
            placeholder={PLACEHOLDERS.RESTRO_TYPE}
            buttonClassName={CLASS_INPUT}
          />
        )}
      />
      <Field
        type="number"
        min={1900}
        max={moment().format("YYYY")}
        label={PLACEHOLDERS.YEAR}
        placeholder={PLACEHOLDERS.YEAR}
        className="my-4"
        classInput={CLASS_INPUT}
        error={errors.yearOfEstablishment?.message}
        {...register("yearOfEstablishment")}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full mb-4"
        disabled={!image || isUploading}
      >
        {isUpdating ? <div className="ring-loader" /> : "Save and Continue"}
      </Button>
    </form>
  );
};

export default UpdateProfilePage;
