import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { object, string, number, date } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Field from "components/Field";
import { Button } from "components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUpdateLogoMutation, useUpdateProfileMutation } from "api/adminApi";
import { useCurrentUserQuery } from "api/authApi";

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
  yearOfEstablishment: string(),
});

const UpdateProfilePage = ({ nextStep }) => {
  const navigate = useNavigate();
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
  } = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(UPDATE_PROFILE_FORM_SCHEMA),
  });

  useEffect(() => {
    if (user) {
      setValue("restroName", user.restroName);
      setValue("ownerFullName", user.ownerFullName);
      setValue("location", user.location);
      setValue("restroType", user.restroType);
      setValue(
        "yearOfEstablishment",
        new Date(user.yearOfEstablishment).getFullYear()
      );
      setImage(user.avatar?.url);
    }
  }, [user, setValue]);

  const handleProfileUpdate = async (data) => {
    if (data.yearOfEstablishment) {
      data.yearOfEstablishment = new Date(data.yearOfEstablishment);
    }
    const response = await updateProfile(data).unwrap();
    if (response.success) {
      nextStep();
    } else {
      console.error("Profile update failed", error);
      alert("Profile update failed");
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const response = await uploadImage(file).unwrap();
        if (response.success) {
          setImageUploaded(true);
          setImage(response.data?.avatar?.url);
        } else {
          alert("Image upload failed");
        }
      } catch (error) {
        console.error("Image upload failed", error);
        alert("Image upload failed");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleProfileUpdate)}
      className="w-full max-w-[31.5rem] mx-auto"
    >
      <div className="mb-4 text-center">
        <label htmlFor="avatar" className="cursor-pointer inline-block">
          {image ? (
            <img
              src={image}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
              <span className="text-gray-500">Upload Image</span>
            </div>
          )}
        </label>
        <input
          id="avatar"
          type="file"
          className="hidden"
          onChange={handleImageChange}
        />
        {isUploading && <p className="text-sm text-blue-500">Uploading...</p>}
      </div>
      <Field
        className="mb-4"
        placeholder={PLACEHOLDERS.RESTRO_NAME}
        icon="restaurant"
        autoComplete="off"
        classInput={CLASS_INPUT}
        error={errors.restroName?.message}
        {...register("restroName")}
      />
      <Field
        className="mb-4"
        placeholder={PLACEHOLDERS.OWNER_NAME}
        icon="owner"
        autoComplete="off"
        classInput={CLASS_INPUT}
        error={errors.ownerFullName?.message}
        {...register("ownerFullName")}
      />
      <Field
        className="mb-4"
        placeholder={PLACEHOLDERS.LOCATION}
        icon="location"
        autoComplete="off"
        classInput={CLASS_INPUT}
        error={errors.location?.message}
        {...register("location")}
      />
      <Field
        className="mb-4"
        placeholder={PLACEHOLDERS.RESTRO_TYPE}
        icon="type"
        autoComplete="off"
        classInput={CLASS_INPUT}
        error={errors.restroType?.message}
        {...register("restroType")}
      />
      <Field
        className="mb-4"
        placeholder={PLACEHOLDERS.YEAR}
        icon="year"
        autoComplete="off"
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
        Save and Continue
      </Button>
    </form>
  );
};

export default UpdateProfilePage;
