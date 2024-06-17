import React, { useState } from "react";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import Field from "components/Field";
// import { loginAction } from "store/AuthSlice";
import { ROUTES } from "routes/RouterConfig";
import { Button } from "components/ui/button";

// const CLASS_INPUT = "bg-n-7 border-n-7 focus:bg-transparent";
const CLASS_INPUT =
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent";
const LOGIN_FORM_SCHEMA = object().shape({
  email: string().email("Email is invalid").required("Email is required"),
  password: string().required("Password is required"),
});

const SignInTab = ({ onClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const navigateToDashboard = () => {
    navigate(ROUTES.VIDEO_MAKER);
  };

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(LOGIN_FORM_SCHEMA),
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  const onSubmit = (data) => {
    const payload = {
      email: data.email,
      password: data.password,
    };
    // dispatch(
    //   loginAction({
    //     payload,
    //     setIsLoading,
    //     onSuccess: navigateToDashboard,
    //   })
    // );
  };

  return (
    <>
      <form action="" onSubmit={handleSubmit(onSubmit)}>
        <Field
          className="mb-4"
          type="email"
          placeholder="Email"
          icon="email"
          autoComplete="email"
          classInput={CLASS_INPUT}
          error={errors.email?.message}
          {...register("email")}
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
            Forgot password?
          </Button>
        </div>

        <Button size="lg" type="submit" className="w-full mb-4">
          Sign In
        </Button>
      </form>
    </>
  );
};

export default SignInTab;
