import { useState, useEffect } from "react";
import { object, ref, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { nanoid } from "@reduxjs/toolkit";

import Field from "components/Field";
import PasswordRequirements from "components/PasswordRequirements";
import { ROUTES } from "routes/RouterConfig";
import { Button } from "components/ui/button";
import { ButtonSpinner } from "components/Spinner";
import { useRegisterMutation, useVerifyUserNameMutation } from "api/authApi";
import { errorToast, successToast } from "lib/helper";
import { PASSWORD_REGEX, PASSWORD_WEAK_MESSAGE } from "lib/authConstants";

const DEFAULT_VALUES = {
  userName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const BUTTON_LABELS = {
  VERIFY: "Verify",
  VERIFIED: "Verified",
  SIGN_UP: "Create account",
};

const ERROR_MESSAGES = {
  USERNAME_MIN_LENGTH: "Username must be at least 5 characters",
  VERIFY_USERNAME: "Please verify your username",
  USERNAME_EXISTS: "That username is taken",
};

const REGISTER_FORM_SCHEMA = object().shape({
  userName: string()
    .required("Username is required")
    .min(5, ERROR_MESSAGES.USERNAME_MIN_LENGTH),
  email: string().email("Email is invalid").required("Email is required"),
  password: string()
    .required("Password is required")
    .matches(PASSWORD_REGEX, PASSWORD_WEAK_MESSAGE),
  confirmPassword: string()
    .required("Please confirm your password")
    .oneOf([ref("password")], "Passwords must match"),
});

const CreateAccountTab = () => {
  const navigate = useNavigate();
  const [isUsernameVerified, setIsUsernameVerified] = useState(false);

  const [verifyUserName, { isLoading: isUsernameVerifying }] =
    useVerifyUserNameMutation();
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();

  const navigateToLoginTab = () => {
    navigate(ROUTES.AUTH, {
      state: { tab: 0, randomTabId: nanoid() },
    });
  };

  const {
    handleSubmit,
    register,
    formState: { errors, dirtyFields },
    setError,
    watch,
    getValues,
  } = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(REGISTER_FORM_SCHEMA),
  });

  const watchedUserName = watch("userName");
  const watchedPassword = watch("password");

  // Any username change invalidates a prior verification.
  useEffect(() => {
    setIsUsernameVerified(false);
  }, [watchedUserName]);

  const handleVerifyUsername = async () => {
    const userName = getValues("userName").trim().toLowerCase();
    if (userName.length < 5) {
      setError("userName", {
        type: "manual",
        message: ERROR_MESSAGES.USERNAME_MIN_LENGTH,
      });
      return;
    }

    try {
      const { success } = await verifyUserName({ username: userName }).unwrap();
      if (success) {
        setIsUsernameVerified(true);
        setError("userName", { type: "manual", message: "" });
      }
    } catch (error) {
      setError("userName", {
        type: "manual",
        message: ERROR_MESSAGES.USERNAME_EXISTS,
      });
    }
  };

  const handleRegistration = async (data) => {
    if (!isUsernameVerified) {
      setError("userName", {
        type: "manual",
        message: ERROR_MESSAGES.VERIFY_USERNAME,
      });
      return;
    }

    try {
      const response = await registerUser({
        email: data.email.trim(),
        username: data.userName.trim().toLowerCase(),
        password: data.password,
      }).unwrap();
      successToast({
        data: response,
        message: "Account created — check your inbox to verify your email.",
      });
      navigateToLoginTab();
    } catch (error) {
      errorToast({ error });
    }
  };

  const verifyButtonText = isUsernameVerifying ? (
    <ButtonSpinner />
  ) : isUsernameVerified ? (
    BUTTON_LABELS.VERIFIED
  ) : (
    BUTTON_LABELS.VERIFY
  );

  return (
    <form onSubmit={handleSubmit(handleRegistration)}>
      <div className="mb-4">
        <label
          htmlFor="register-username"
          className="flex mb-2 text-sm font-medium text-foreground"
        >
          Username
        </label>
        <div className="flex items-start gap-3">
          <Field
            autoFocus
            id="register-username"
            placeholder="Choose a username"
            className="w-full"
            icon="profile"
            autoComplete="username"
            error={errors.userName?.message}
            {...register("userName")}
          />
          <Button
            type="button"
            size="lg"
            variant={isUsernameVerified ? "secondary" : "outline"}
            className="h-12 shrink-0"
            disabled={
              isUsernameVerified || isUsernameVerifying || !dirtyFields.userName
            }
            onClick={handleVerifyUsername}
          >
            {verifyButtonText}
          </Button>
        </div>
      </div>
      <Field
        className="mb-4"
        type="email"
        label="Email"
        placeholder="you@restaurant.com"
        icon="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <div className="mb-4">
        <Field
          type="password"
          label="Password"
          placeholder="Create a password"
          icon="lock"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordRequirements value={watchedPassword} />
      </div>
      <Field
        className="mb-4"
        type="password"
        label="Confirm password"
        placeholder="Re-enter your password"
        icon="lock"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" size="lg" className="w-full mb-4">
        {isRegistering ? <ButtonSpinner /> : BUTTON_LABELS.SIGN_UP}
      </Button>
      <p className="mt-4 text-xs text-center text-muted-foreground">
        By creating an account, you agree to our{" "}
        <span className="font-medium text-foreground">Terms of Service</span> and{" "}
        <span className="font-medium text-foreground">Privacy Policy</span>.
      </p>
    </form>
  );
};

export default CreateAccountTab;
