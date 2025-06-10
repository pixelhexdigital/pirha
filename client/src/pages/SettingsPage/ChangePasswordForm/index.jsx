import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { object, ref, string } from "yup";

import Field from "components/Field";
import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { useChangePasswordMutation } from "api/authApi";
import { errorToast, successToast } from "lib/helper";

// Input class styles
const CLASS_INPUT =
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent";

// Default form values
const DEFAULT_VALUES = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

const FORM_VALIDATION_SCHEMA = object().shape({
  currentPassword: string().required("Current password is required"),
  newPassword: string()
    .required("New password is required")
    .min(8, "New password must be at least 8 characters long"),
  confirmNewPassword: string()
    .oneOf([ref("newPassword"), null], "Passwords must match")
    .required("Confirm new password is required"),
});

const ChangePasswordForm = () => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(FORM_VALIDATION_SCHEMA),
  });

  const [changePassword, { isLoading: isLoadingChangePassword }] =
    useChangePasswordMutation();

  const onSubmit = async (data) => {
    const payload = {
      oldPassword: data.currentPassword,
      newPassword: data.newPassword,
    };

    try {
      const response = await changePassword(payload).unwrap();
      successToast({
        data: response,
        message: "Password changed successfully!",
      });
      reset();
    } catch (error) {
      console.error("error", error);
      errorToast({ error });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your password to keep your account secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full mx-auto">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 ">
            <Field
              label="Current Password"
              type="password"
              placeholder="Enter your current password"
              error={errors.currentPassword?.message}
              {...register("currentPassword")}
              classInput={CLASS_INPUT}
            />
            <Field
              label="New Password"
              type="password"
              placeholder="Enter your new password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
              classInput={CLASS_INPUT}
            />
            <Field
              label="Confirm New Password"
              type="password"
              placeholder="Confirm your new password"
              error={errors.confirmNewPassword?.message}
              {...register("confirmNewPassword")}
              classInput={CLASS_INPUT}
            />
          </div>
          <Button
            type="submit"
            className="mt-4 w-36"
            disabled={isLoadingChangePassword}
          >
            {isLoadingChangePassword ? (
              <div className="ring-loader" />
            ) : (
              "Change Password"
            )}
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            If you forget your password, you can reset it using the &quot;Forgot
            Password&quot; link on the login page.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;
