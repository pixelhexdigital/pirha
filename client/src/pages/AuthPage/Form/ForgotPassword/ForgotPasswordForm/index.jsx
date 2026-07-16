import { useForm } from "react-hook-form";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import Field from "components/Field";
import { Button } from "components/ui/button";
import { useForgotPasswordMutation } from "api/authApi";
import { errorToast, successToast } from "lib/helper";

const FORGOT_PASSWORD_SCHEMA = object().shape({
  email: string().email("Email is invalid").required("Email is required"),
});

const ForgotPasswordForm = ({ onSuccess }) => {
  const form = useForm({
    defaultValues: {
      email: "",
    },
    resolver: yupResolver(FORGOT_PASSWORD_SCHEMA),
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  const [forgotPasswordMutation, { isLoading: isForgotPasswordLoading }] =
    useForgotPasswordMutation();

  const onSubmit = async (data) => {
    const payload = {
      email: data.email,
    };
    try {
      const response = await forgotPasswordMutation(payload).unwrap();
      successToast({
        data: response,
        message: "If that email exists, we've sent a reset link.",
      });
      onSuccess();
    } catch (error) {
      errorToast({
        error,
        message: "Failed to send password reset link",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field
        autoFocus
        className="mb-4"
        type="email"
        label="Email"
        placeholder="you@restaurant.com"
        icon="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button
        type="submit"
        size="lg"
        disabled={isForgotPasswordLoading}
        className="w-full mb-6"
      >
        {isForgotPasswordLoading ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
