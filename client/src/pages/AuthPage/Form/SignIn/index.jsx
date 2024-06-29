import { useEffect } from "react";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import Field from "components/Field";
import { ROUTES } from "routes/RouterConfig";
import { Button } from "components/ui/button";
import { useLoginMutation } from "api/authApi";
import { errorToast, successToast } from "lib/helper";

// Input class styles
const CLASS_INPUT =
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent";

// Password validation regex
const PASSWORD_REGEX =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])(?=.*[a-zA-Z]).{8,}$/;

// Default form values
const DEFAULT_VALUES = {
  username: "sagar",
  password: "Sagar@123",
};

// Button labels
const BUTTON_LABELS = {
  FORGOT_PASSWORD: "Forgot password?",
  SIGN_IN: "Sign In",
};

// Error messages
const ERROR_MESSAGES = {
  USERNAME_REQUIRED: "Username is required",
  USERNAME_MIN_LENGTH: "Username must be at least 5 characters",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_WEAK:
    "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special case character",
};

// Yup schema for form validation
const LOGIN_FORM_SCHEMA = object().shape({
  username: string()
    .required(ERROR_MESSAGES.USERNAME_REQUIRED)
    .min(5, ERROR_MESSAGES.USERNAME_MIN_LENGTH),
  password: string()
    .required(ERROR_MESSAGES.PASSWORD_REQUIRED)
    .test({
      name: "password",
      message: ERROR_MESSAGES.PASSWORD_WEAK,
      test: (value) => PASSWORD_REGEX.test(value),
    }),
});

const SignInTab = ({ onClick }) => {
  const navigate = useNavigate();

  // Hook to manage login mutation
  const [login, { isLoading: isLoginLoading, isSuccess, data }] =
    useLoginMutation();

  // Navigate to onboarding or dashboard based on the response
  useEffect(() => {
    if (!isSuccess) return;
    const { ownerFullName, restroName } = data.restaurant;
    if (ownerFullName || restroName) {
      navigate(ROUTES.ONBOARDING, { replace: true });
    } else {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [data, isSuccess, navigate]);

  // useForm hook for managing form state and validation
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(LOGIN_FORM_SCHEMA),
  });

  // Watching the username field to convert it to lowercase
  const watchedUserName = watch("username");

  useEffect(() => {
    setValue("username", watchedUserName.toLowerCase());
  }, [watchedUserName, setValue]);

  // Handle form submission for signing in
  const handleSignIn = async (data) => {
    const payload = {
      username: data.username,
      password: data.password,
    };

    try {
      const response = await login(payload).unwrap();
      successToast({ data: response, message: "Logged in successfully" });
    } catch (error) {
      console.error("error", error);
      errorToast({ error });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleSignIn)}>
        <Field
          placeholder="Username"
          className="w-full mb-4"
          icon="profile"
          autoComplete="off"
          error={errors.username?.message}
          classInput={CLASS_INPUT}
          {...register("username")}
        />
        <Field
          className="mb-4"
          type="password"
          placeholder="Password"
          icon="lock"
          autoComplete="current-password"
          classInput={CLASS_INPUT}
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="w-full mb-6 text-end">
          <Button
            variant="link"
            type="button"
            onClick={onClick}
            className="text-black hover:text-primary/90"
          >
            {BUTTON_LABELS.FORGOT_PASSWORD}
          </Button>
        </div>

        <Button size="lg" type="submit" className="w-full mb-4">
          {isLoginLoading ? (
            <div className="ring-loader" />
          ) : (
            BUTTON_LABELS.SIGN_IN
          )}
        </Button>
      </form>
    </>
  );
};

export default SignInTab;
