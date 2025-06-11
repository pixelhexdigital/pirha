import { useForm } from "react-hook-form";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import Field from "components/Field";
import { Button } from "components/ui/button";
import { useForgotPasswordMutation } from "api/authApi";
import { errorToast, successToast } from "lib/helper";

const CLASS_INPUT =
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent";
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
        message: "Password reset link sent to your email",
      });
      onSuccess();
    } catch (error) {
      errorToast({
        data: error,
        message: "Failed to send password reset link",
      });
    }
  };

  return (
    <form action="" onSubmit={handleSubmit(onSubmit)}>
      <Field
        className="mb-4"
        placeholder="Username or email"
        error={errors.email?.message}
        classInput={CLASS_INPUT}
        {...register("email")}
      />
      <Button type="submit" size="lg" className="w-full mb-6 ">
        {isForgotPasswordLoading ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
