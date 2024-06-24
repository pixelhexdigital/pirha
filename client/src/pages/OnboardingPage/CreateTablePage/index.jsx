import { useForm } from "react-hook-form";
import { Button } from "components/ui/button";
import Field from "components/Field";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, number, string } from "yup";

// Validation schema
const CREATE_TABLE_SCHEMA = object().shape({
  numberOfTables: number()
    .required("Number of tables is required")
    .min(1, "At least one table is required"),
  prefixOfTables: string().required("Prefix of tables is required"),
});

const CreateTablePage = ({ onNext }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(CREATE_TABLE_SCHEMA),
    defaultValues: {
      prefixOfTables: "A", // Default value for the dropdown
    },
  });

  const onSubmit = (data) => {
    // Handle table creation logic here
    onNext();
  };

  // Generate options for the dropdown
  const alphabetOptions = [...Array(26)].map((_, i) => (
    <option key={i} value={String.fromCharCode(65 + i)}>
      {String.fromCharCode(65 + i)}
    </option>
  ));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-[31.5rem] mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4">Create Tables</h2>
      <div className="mb-4">
        <label
          htmlFor="prefixOfTables"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Prefix of tables
        </label>
        <select
          id="prefixOfTables"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          {...register("prefixOfTables")}
        >
          {alphabetOptions}
        </select>
        {errors.prefixOfTables && (
          <p className="mt-2 text-sm text-red-600">
            {errors.prefixOfTables.message}
          </p>
        )}
      </div>
      <div className="mb-4">
        <Field
          type="number"
          placeholder="Number of tables"
          className="w-full"
          error={errors.numberOfTables?.message}
          {...register("numberOfTables")}
        />
      </div>
      <Button type="submit" size="lg" className="w-full">
        Generate QR and Next
      </Button>
    </form>
  );
};

export default CreateTablePage;
