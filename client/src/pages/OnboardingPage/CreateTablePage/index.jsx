import { Controller, useForm } from "react-hook-form";
import { object, number, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { useGenerateTableQrMutation } from "api/tableApi";

import Field from "components/Field";
import { Button } from "components/ui/button";
import { Combobox } from "components/ui/Combobox";
import { errorToast, successToast } from "lib/helper";
import { ButtonSpinner } from "components/Spinner";

const MAX_ALLOWED_TABLES = 5;

// Validation schema
const CREATE_TABLE_SCHEMA = object().shape({
  numberOfTables: number()
    .required("Number of tables is required")
    .min(1, "At least one table is required")
    .max(MAX_ALLOWED_TABLES, `Maximum of ${MAX_ALLOWED_TABLES} tables allowed`)
    .typeError("Number of tables must be a number"),
  prefixOfTables: string().required("Prefix of tables is required"),
});

// Messages
const MESSAGES = {
  GENERATE_SUCCESS: "QR codes generated successfully",
  GENERATE_FAILURE:
    "Failed to generate QR codes for tables, please try again later",
};

// Helper function to generate alphabet options
const generateAlphabetOptions = () =>
  [...Array(26)].map((_, i) => ({
    label: String.fromCharCode(65 + i),
    value: String.fromCharCode(65 + i),
  }));

const CreateTablePage = ({ onNext }) => {
  const [generateTableQr, { isLoading: generatingQr }] =
    useGenerateTableQrMutation();

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(CREATE_TABLE_SCHEMA),
    defaultValues: { prefixOfTables: "A" },
  });

  const alphabetOptions = generateAlphabetOptions();

  const onSubmit = async (data) => {
    const payload = {
      letter: data.prefixOfTables.toLowerCase(),
      startTable: 1,
      endTable: data.numberOfTables,
      capacity: 4,
      bulkCreate: true,
    };

    try {
      const response = await generateTableQr(payload).unwrap();
      successToast({
        data: response,
        message: MESSAGES.GENERATE_SUCCESS,
      });
      onNext();
    } catch (error) {
      errorToast({
        error,
        message: MESSAGES.GENERATE_FAILURE,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="mb-4">
        <Controller
          name="prefixOfTables"
          control={control}
          render={({ field }) => (
            <Combobox
              data={alphabetOptions}
              value={field.value}
              setValue={field.onChange}
              showSearchInput={true}
              error={errors.prefixOfTables?.message}
              label="Table prefix"
              placeholder="Select a prefix"
            />
          )}
        />
      </div>
      <Field
        autoFocus
        type="number"
        max={MAX_ALLOWED_TABLES}
        min={1}
        label="Number of tables"
        placeholder="e.g. 5"
        note={`Up to ${MAX_ALLOWED_TABLES} tables — you can add more later.`}
        className="mb-6"
        error={errors.numberOfTables?.message}
        {...register("numberOfTables")}
      />

      <Button type="submit" size="lg" className="w-full" disabled={generatingQr}>
        {generatingQr ? <ButtonSpinner /> : "Generate QR codes"}
      </Button>
    </form>
  );
};

export default CreateTablePage;
