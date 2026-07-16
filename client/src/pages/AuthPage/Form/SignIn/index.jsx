import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import Field from "components/Field";
import { ROUTES } from "routes/RouterConfig";
import { Button } from "components/ui/button";
import { ButtonSpinner } from "components/Spinner";
import { useLoginMutation } from "api/authApi";
import { errorToast, successToast } from "lib/helper";
import { PASSWORD_REGEX, PASSWORD_WEAK_MESSAGE } from "lib/authConstants";

const ONBOARDING_COMPLETE = "COMPLETED";

const DEFAULT_VALUES = {
  username: "",
  password: "",
};

const BUTTON_LABELS = {
  FORGOT_PASSWORD: "Forgot password?",
  SIGN_IN: "Sign In",
};

const LOGIN_FORM_SCHEMA = object().shape({
  username: string()
    .required("Username is required")
    .min(5, "Username must be at least 5 characters"),
  password: string()
    .required("Password is required")
    .matches(PASSWORD_REGEX, PASSWORD_WEAK_MESSAGE),
});

const SignInTab = ({ onClick }) => {
  const navigate = useNavigate();

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(LOGIN_FORM_SCHEMA),
  });

  const handleRedirect = (data) => {
    const { onboardingState } = data?.restaurant || {};
    navigate(
      onboardingState === ONBOARDING_COMPLETE
        ? ROUTES.DASHBOARD
        : ROUTES.ONBOARDING,
      { replace: true }
    );
  };

  const handleSignIn = async (data) => {
    try {
      const response = await login({
        username: data.username.trim().toLowerCase(),
        password: data.password,
      }).unwrap();
      successToast({ data: response, message: "Logged in successfully" });
      handleRedirect(response);
    } catch (error) {
      errorToast({ error });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSignIn)}>
      <Field
        autoFocus
        label="Username"
        placeholder="Your username"
        className="w-full mb-4"
        icon="profile"
        autoComplete="username"
        error={errors.username?.message}
        {...register("username")}
      />
      <Field
        className="mb-4"
        type="password"
        label="Password"
        placeholder="Your password"
        icon="lock"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="w-full mb-6 text-end">
        <Button
          variant="link"
          type="button"
          onClick={onClick}
          className="h-auto p-0 text-sm text-muted-foreground hover:text-primary"
        >
          {BUTTON_LABELS.FORGOT_PASSWORD}
        </Button>
      </div>

      <Button
        size="lg"
        type="submit"
        disabled={isLoginLoading}
        className="w-full mb-4"
      >
        {isLoginLoading ? <ButtonSpinner /> : BUTTON_LABELS.SIGN_IN}
      </Button>
    </form>
  );
};

export default SignInTab;
