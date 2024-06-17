import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { number, object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";

import Field from "components/Field";
import { Button } from "components/ui/button";
// import { resetPasswordAction } from "store/AuthSlice";

const CLASS_INPUT = "bg-n-7 border-n-7 focus:bg-transparent";
const DEFAULT_VALUES = {
  otp: "",
  password: "",
  confirmPassword: "",
};

const RESET_PASSWORD_SCHEMA = object().shape({
  otp: number()
    .typeError("Must be a number")
    .required("OTP is required")
    .test(
      "len",
      "Must be exactly 4 digits",
      (val) => val && val.toString().length === 4
    ),
  password: string().required("Password is required"),
  confirmPassword: string()
    .test("passwords-match", "Passwords must match", function (value) {
      return this.parent.password === value;
    })
    .required("Required"),
});

const ResetPasswordForm = ({ email, onClick }) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(RESET_PASSWORD_SCHEMA),
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  const onSubmit = (data) => {
    const payload = {
      email: email,
      otp: data.otp,
      password: data.password,
    };
    // dispatch(
    //   resetPasswordAction({ payload, setIsLoading, onSuccess: onClick })
    // );
  };
  return (
    <form action="" onSubmit={handleSubmit(onSubmit)}>
      <Field
        disabled
        value={email}
        placeholder="Email"
        className="mb-4"
        classInput={CLASS_INPUT}
      />
      <Field
        placeholder="OTP"
        className="mb-4"
        classInput={CLASS_INPUT}
        error={errors.otp?.message}
        {...register("otp")}
      />
      <Field
        className="mb-4"
        type="password"
        autoComplete="off"
        placeholder="Password"
        classInput={CLASS_INPUT}
        error={errors.password?.message}
        {...register("password")}
      />
      <Field
        className="mb-4"
        type="password"
        autoComplete="off"
        placeholder="Re-enter Password"
        classInput={CLASS_INPUT}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button
        title="Reset password"
        type="submit"
        loader={isLoading}
        className="w-full mb-6 btn-blue btn-large"
      />
    </form>
  );
};

export default ResetPasswordForm;
