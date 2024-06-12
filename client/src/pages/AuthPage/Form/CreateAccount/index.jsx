import { useState } from "react";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import Field from "components/Field";
// import { registerAction } from "store/AuthSlice";
import { ROUTES } from "routes/RouterConfig";
import { Button } from "components/ui/button";

const CLASS_INPUT =
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent";
const DEFAULT_VALUES = {
  userName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "USER",
};

const REGISTER_FORM_SCHEMA = object().shape({
  userName: string().required("Username is required"),
  email: string().email("Email is invalid").required("Email is required"),
  password: string().required("Password is required"),
  confirmPassword: string()
    .test("passwords-match", "Passwords must match", function (value) {
      return this.parent.password === value;
    })
    .required("Required"),
});

const CreateAccountTab = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameVerified, setIsUsernameVerified] = useState(false);

  const navigateToDashboard = () => {
    navigate(ROUTES.AUTH, {
      state: { tab: 0 },
    });
  };

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(REGISTER_FORM_SCHEMA),
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  const onSubmit = (data) => {
    const payload = {
      username: data.userName,
      email: data.email,
      password: data.password,
      role: data.role.toUpperCase(),
    };

    // dispatch(
    //   registerAction({
    //     payload,
    //     setIsLoading,
    //     onSuccess: navigateToDashboard,
    //   })
    // );
  };

  return (
    <form action="" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-4 mb-4">
        <Field
          placeholder="Username"
          className="w-full"
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
          disabled={isUsernameVerified}
          onClick={() => setIsUsernameVerified(true)}
        >
          {isUsernameVerified ? "Verified" : "Verify"}
        </Button>
      </div>
      <Field
        className="mb-4"
        type="email"
        placeholder="Email"
        icon="email"
        autoComplete="off"
        classInput={CLASS_INPUT}
        error={errors.email?.message}
        {...register("email")}
      />
      <Field
        className="mb-4"
        type="password"
        placeholder="Password"
        icon="lock"
        autoComplete="off"
        classInput={CLASS_INPUT}
        error={errors.password?.message}
        {...register("password")}
      />
      <Field
        className="mb-4"
        type="password"
        placeholder="Re-enter Password"
        icon="lock"
        autoComplete="off"
        classInput={CLASS_INPUT}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" size="lg" className="w-full mb-4">
        Sign Up
      </Button>
      <div className="mt-4 text-center caption1 text-n-4 dark:text-n-3">
        By creating an account, you agree to our{" "}
        <Link
          className="transition-colors text-n-5 dark:hover:text-n-1 hover:underline dark:text-n-2"
          href="/"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          className="transition-colors text-n-5 dark:hover:text-n-1 hover:underline dark:text-n-2"
          href="/"
        >
          Privacy & Cookie Statement
        </Link>
        .
      </div>
    </form>
  );
};

export default CreateAccountTab;
