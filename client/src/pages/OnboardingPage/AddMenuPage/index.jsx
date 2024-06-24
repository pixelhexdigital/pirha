import { useForm } from "react-hook-form";
import { Button } from "components/ui/button";
import Field from "components/Field";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";

// Validation schema
const ADD_MENU_SCHEMA = object().shape({
  menuItem: string().required("Menu item is required"),
  price: string().required("Price is required"),
});

const AddMenuPage = ({ onNext }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ADD_MENU_SCHEMA),
  });

  const onSubmit = (data) => {
    // Handle menu item addition logic here
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-[31.5rem] mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4">Add Menu Items</h2>
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
