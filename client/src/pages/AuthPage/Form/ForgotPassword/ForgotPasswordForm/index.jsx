import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";

import Field from "components/Field";
import { Button } from "components/ui/button";
// import { forgotPasswordAction } from "store/AuthSlice";

const CLASS_INPUT =
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent";
const FORGOT_PASSWORD_SCHEMA = object().shape({
  email: string().email("Email is invalid").required("Email is required"),
});

const ForgotPasswordForm = ({ setResetPasswordForm }) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmit = (data) => {
    const payload = {
      email: data.email,
    };
    // dispatch(
    //   forgotPasswordAction({ payload, setIsLoading, setResetPasswordForm })
    // );
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
        Reset password
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
