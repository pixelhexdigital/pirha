import { object, ref, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

import Field from "components/Field";
import PasswordRequirements from "components/PasswordRequirements";
import { Button } from "components/ui/button";
import { ButtonSpinner } from "components/Spinner";
import { useResetPasswordMutation } from "api/authApi";
import { errorToast, successToast } from "lib/helper";
import { PASSWORD_REGEX, PASSWORD_WEAK_MESSAGE } from "lib/authConstants";

const DEFAULT_VALUES = {
  password: "",
  confirmPassword: "",
};

const RESET_PASSWORD_SCHEMA = object().shape({
  password: string()
    .required("Password is required")
    .matches(PASSWORD_REGEX, PASSWORD_WEAK_MESSAGE),
  confirmPassword: string()
    .required("Please confirm your password")
    .oneOf([ref("password")], "Passwords must match"),
});

const ResetPasswordForm = ({ resetToken, onClick }) => {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(RESET_PASSWORD_SCHEMA),
  });

  const onSubmit = async (data) => {
    try {
      await resetPassword({ resetToken, newPassword: data.password }).unwrap();
      successToast({ message: "Password reset successfully. Please sign in." });
      onClick?.();
    } catch (error) {
      errorToast({ error, message: "Failed to reset password" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <Field
          autoFocus
          type="password"
          label="New password"
          autoComplete="new-password"
          placeholder="Enter a new password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordRequirements value={watch("password")} />
      </div>
      <Field
        className="mb-6"
        type="password"
        label="Confirm password"
        autoComplete="new-password"
        placeholder="Re-enter your new password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button size="lg" type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <ButtonSpinner /> : "Reset Password"}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
