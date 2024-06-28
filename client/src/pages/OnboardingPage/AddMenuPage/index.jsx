import { useForm } from "react-hook-form";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";

import Field from "components/Field";
import { Button } from "components/ui/button";
import { ROUTES } from "routes/RouterConfig";

// Validation schema
const ADD_MENU_SCHEMA = object().shape({
  menuItem: string().required("Menu item is required"),
  price: string().required("Price is required"),
});

const AddMenuPage = ({ onNext }) => {
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ADD_MENU_SCHEMA),
  });

  const navigateToDashboard = () => {
    navigate(ROUTES.DASHBOARD);
  };

  const onSubmit = (data) => {
    // Handle menu item addition logic here
    console.log(data);
    navigateToDashboard();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-xl px-4 mx-auto"
    >
      <div className="mb-4">
        <Field
          type="text"
          placeholder="Menu item"
          className="w-full"
          error={errors.menuItem?.message}
          {...register("menuItem")}
        />
      </div>
      <div className="mb-4">
        <Field
          type="text"
          placeholder="Price"
          className="w-full"
          error={errors.price?.message}
          {...register("price")}
        />
      </div>
      <Button type="submit" size="lg" className="w-full">
        Next
      </Button>
    </form>
  );
};

export default AddMenuPage;
