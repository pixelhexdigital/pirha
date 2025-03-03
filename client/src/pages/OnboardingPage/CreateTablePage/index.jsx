import { Controller, useForm } from "react-hook-form";
import { object, number, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  useDownloadQrMutation,
  useGenerateTableQrMutation,
  useGetMyTablesQuery,
} from "api/tableApi";

import Field from "components/Field";
import { Button } from "components/ui/button";
import { Combobox } from "components/ui/Combobox";
import { errorToast, successToast } from "lib/helper";

const MAX_ALLOWED_TABLES = 5;

// Constants for class names and placeholders
const CLASS_INPUT =
  "border-n-7 focus:bg-transparent dark:bg-n-7 dark:border-n-7 dark:focus:bg-transparent";
const PLACEHOLDERS = {
  PREFIX_OF_TABLES: "Prefix of tables",
  NUMBER_OF_TABLES: "Number of tables",
  START: "Start",
  START_NUMBER: "Start Number",
  END_NUMBER: "End Number",
  TABLE_NUMBER: "Table Number",
};

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
  DOWNLOAD_SUCCESS: "QR codes downloaded successfully",
  DOWNLOAD_FAILURE: "Failed to download QR codes, please try again later",
};

// Helper function to generate alphabet options
const generateAlphabetOptions = () =>
  [...Array(26)].map((_, i) => ({
    label: String.fromCharCode(65 + i),
    value: String.fromCharCode(65 + i),
  }));

const CreateTablePage = ({ onNext }) => {
  const [generateTableQr, { data: qrData, isLoading: generatingQr }] =
    useGenerateTableQrMutation();
  const [downloadQr, { isLoading: downloadingQr }] = useDownloadQrMutation();

  const { data: tableData } = useGetMyTablesQuery();

  const qrDataSuccess = qrData?.success;

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
    if (qrDataSuccess) {
      onNext();
      return;
    }

    const payload = {
      letter: data.prefixOfTables.toLowerCase(),
      tables: data.numberOfTables,
    };

    try {
      const response = await generateTableQr(payload).unwrap();
      successToast({
        data: response,
        message: MESSAGES.GENERATE_SUCCESS,
      });
    } catch (error) {
      errorToast({
        error,
        message: MESSAGES.GENERATE_FAILURE,
      });
    }
  };

  const handleDownloadQr = async () => {
    const tables = tableData?.data?.tables;

    const payload = {
      startTable: tables?.[0]?.title ?? "",
      endTable: tables?.[tables.length - 1]?.title ?? "",
    };

    try {
      const blob = await downloadQr(payload).unwrap();

      if (!(blob instanceof Blob)) {
        throw new Error("Invalid file response"); // Check if response is a Blob
      }

      // Create a URL for the file
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor tag and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "qr_codes.zip");
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      successToast({
        message: "QR codes downloaded successfully!",
      });
    } catch (error) {
      console.error("Error downloading QR codes:", error);
      errorToast({
        error,
        message: "Failed to download QR codes.",
      });
    }
  };

  if (tableData?.success && tableData.data?.tables?.length) {
    return (
      <div className="w-full max-w-xl px-4 mx-auto">
        <p className="mb-4 font-semibold text-gray-800">
          Tables created successfully. Download the QR codes for the tables
          below.
        </p>
        <div className="grid grid-cols-3 gap-4 md:grid-cols-5 max-h-svh">
          {tableData.data.tables.map((table) => {
            return (
              <p
                className="p-4 text-center capitalize bg-secondary min-w-min text-secondary-foreground"
                key={table._id.toString()}
              >
                {table.title}
              </p>
            );
          })}
        </div>
        <div className="flex flex-row gap-4 mt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            onClick={handleDownloadQr}
          >
            {downloadingQr ? <div className="ring-loader" /> : "Download QR"}
          </Button>
          <Button type="" size="lg" className="w-full" onClick={onNext}>
            Next
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-xl px-4 mx-auto"
    >
      <p className="mb-4 font-semibold text-gray-800">
        Create tables for your restaurant by generating QR codes for them here.
      </p>
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
            label={PLACEHOLDERS.PREFIX_OF_TABLES}
            placeholder={PLACEHOLDERS.PREFIX_OF_TABLES}
            buttonClassName={CLASS_INPUT}
          />
        )}
      />
      <div className="my-4">
        <Field
          type="number"
          max={MAX_ALLOWED_TABLES}
          min={1}
          placeholder={PLACEHOLDERS.NUMBER_OF_TABLES}
          className="w-full"
          classInput={CLASS_INPUT}
          error={errors.numberOfTables?.message}
          {...register("numberOfTables")}
        />
      </div>

      <Button type="submit" size="lg" className="w-full">
        {generatingQr ? <div className="ring-loader" /> : "Generate QR"}
      </Button>
    </form>
  );
};

export default CreateTablePage;
