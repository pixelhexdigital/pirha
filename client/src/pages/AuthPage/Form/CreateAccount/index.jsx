import { useState, useEffect } from "react";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { nanoid } from "@reduxjs/toolkit";

import Field from "components/Field";
import { ROUTES } from "routes/RouterConfig";
import { Button } from "components/ui/button";
import { useRegisterMutation, useVerifyUserNameMutation } from "api/authApi";
import { errorToast, successToast } from "lib/helper";

// Input class styles
const CLASS_INPUT =
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent";

// Default form values
const DEFAULT_VALUES = {
  userName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

// Regex for password validation
const PASSWORD_REGEX =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])(?=.*[a-zA-Z]).{8,}$/;

// Button labels
const BUTTON_LABELS = {
  VERIFY: "Verify",
  VERIFIED: "Verified",
  SIGN_UP: "Sign Up",
};

// Error messages
const ERROR_MESSAGES = {
  USERNAME_REQUIRED: "Username is required",
  USERNAME_MIN_LENGTH: "Username must be at least 5 characters",
  EMAIL_INVALID: "Email is invalid",
  EMAIL_REQUIRED: "Email is required",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_WEAK:
    "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special case character",
  PASSWORDS_MATCH: "Passwords must match",
  VERIFY_USERNAME: "Please verify username",
  USERNAME_EXISTS: "Username already exists",
};

// Input placeholders
const PLACEHOLDERS = {
  USERNAME: "Username",
  EMAIL: "Email",
  PASSWORD: "Password",
  CONFIRM_PASSWORD: "Re-enter Password",
};

// Yup schema for form validation
const REGISTER_FORM_SCHEMA = object().shape({
  userName: string()
    .required(ERROR_MESSAGES.USERNAME_REQUIRED)
    .min(5, ERROR_MESSAGES.USERNAME_MIN_LENGTH),
  email: string()
    .email(ERROR_MESSAGES.EMAIL_INVALID)
    .required(ERROR_MESSAGES.EMAIL_REQUIRED),
  password: string()
    .required(ERROR_MESSAGES.PASSWORD_REQUIRED)
    .test("password", ERROR_MESSAGES.PASSWORD_WEAK, (value) =>
      PASSWORD_REGEX.test(value)
    ),
  confirmPassword: string()
    .required("Required")
    .test("passwords-match", ERROR_MESSAGES.PASSWORDS_MATCH, function (value) {
      // `this.options.context` gives you access to the sibling fields
      const { password } = this.parent;
      return password === value;
    }),
});

const CreateAccountTab = () => {
  const navigate = useNavigate();
  const [isUsernameVerified, setIsUsernameVerified] = useState(false);

  // Hooks for API mutations
  const [verifyUserName, { isLoading: isUsernameVerifying }] =
    useVerifyUserNameMutation();
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();

  // Navigate to login tab with a random tab ID to force re-render
  const navigateToLoginTab = () => {
    navigate(ROUTES.AUTH, {
      state: { tab: 0, randomTabId: nanoid() },
    });
  };

  // useForm hook for form handling
  const {
    handleSubmit,
    register,
    formState: { errors, dirtyFields },
    setError,
    watch,
    getValues,
    setValue,
  } = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(REGISTER_FORM_SCHEMA),
  });

  const watchedUserName = watch("userName");

  // Lowercase the username and reset username verification on username change
  useEffect(() => {
    setIsUsernameVerified(false);
    setValue("userName", watchedUserName.toLowerCase());
  }, [watchedUserName, setValue]);

  // Function to verify username on button click
  const handleVerifyUsername = async () => {
    const userName = getValues("userName");
    if (userName?.length < 5) {
      setError("userName", {
        type: "manual",
        message: ERROR_MESSAGES.USERNAME_MIN_LENGTH,
      });
      return;
    }

    try {
      const response = await verifyUserName({ username: userName }).unwrap();
      const { success } = response;
      if (success) {
        setIsUsernameVerified(true);
        setError("userName", {
          type: "manual",
          message: "",
        });
      }
    } catch (error) {
      setError("userName", {
        type: "manual",
        message: ERROR_MESSAGES.USERNAME_EXISTS,
      });
    }
  };

  // Function to handle registration on form submit
  const handleRegistration = async (data) => {
    if (!isUsernameVerified) {
      setError("userName", {
        type: "manual",
        message: ERROR_MESSAGES.VERIFY_USERNAME,
      });
      return;
    }

    const payload = {
      email: data.email,
      username: data.userName,
      password: data.password,
    };

    try {
      const response = await registerUser(payload).unwrap();
      successToast({
        data: response,
        message: "Account created successfully",
      });
      navigateToLoginTab();
    } catch (error) {
      errorToast({ error });
    }
  };

  const verifyButtonText = isUsernameVerifying ? (
    <div className="ring-loader" />
  ) : isUsernameVerified ? (
    BUTTON_LABELS.VERIFIED
  ) : (
    BUTTON_LABELS.VERIFY
  );

  return (
    <form onSubmit={handleSubmit(handleRegistration)}>
      <div className="flex gap-4 mb-4">
        <Field
          placeholder={PLACEHOLDERS.USERNAME}
          className="w-full lowercase"
          icon="profile"
          autoComplete="off"
          error={errors.userName?.message}
          classInput={CLASS_INPUT}
          {...register("userName")}
        />
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-12"
          disabled={
            isUsernameVerified || isUsernameVerifying || !dirtyFields.userName
          }
          onClick={handleVerifyUsername}
        >
          {verifyButtonText}
        </Button>
      </div>
      <Field
        className="mb-4"
        type="email"
        placeholder={PLACEHOLDERS.EMAIL}
        icon="email"
        autoComplete="off"
        classInput={CLASS_INPUT}
        error={errors.email?.message}
        {...register("email")}
      />
      <Field
        className="mb-4"
        type="password"
        placeholder={PLACEHOLDERS.PASSWORD}
        icon="lock"
        autoComplete="off"
        classInput={CLASS_INPUT}
        error={errors.password?.message}
        {...register("password")}
      />
      <Field
        className="mb-4"
        type="password"
        placeholder={PLACEHOLDERS.CONFIRM_PASSWORD}
        icon="lock"
        autoComplete="off"
        classInput={CLASS_INPUT}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" size="lg" className="w-full mb-4">
        {isRegistering ? (
          <div className="ring-loader" />
        ) : (
          BUTTON_LABELS.SIGN_UP
        )}
      </Button>
      <div className="mt-4 text-center caption1 text-n-4 dark:text-n-3">
        By creating an account, you agree to our{" "}
        <Link
          className="transition-colors text-n-5 dark:hover:text-n-1 hover:underline dark:text-n-2"
          to="/"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          className="transition-colors text-n-5 dark:hover:text-n-1 hover:underline dark:text-n-2"
          to="/"
        >
          Privacy & Cookie Statement
        </Link>
        .
      </div>
    </form>
  );
};

export default CreateAccountTab;
