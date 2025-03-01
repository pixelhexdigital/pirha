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
import { Switch } from "components/ui/switch";
import { Label } from "components/ui/label";
import { useState } from "react";

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
  const [isBulkCreation, setIsBulkCreation] = useState(false);

  const [generateTableQr, { data: qrData, isLoading: generatingQr }] =
    useGenerateTableQrMutation();
  const [downloadQr, { data: qrDownloadData, isLoading: downloadingQr }] =
    useDownloadQrMutation();

  const { data: tableData, isLoading } = useGetMyTablesQuery();

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
      console.error("Error generating QR codes:", error);
    }
  };

  const handleDownloadQr = async () => {
    try {
      const response = await downloadQr({}).unwrap();
      successToast({
        data: response,
        message: MESSAGES.DOWNLOAD_SUCCESS,
      });
    } catch (error) {
      console.error("Error downloading QR codes:", error);
      errorToast({
        error,
        message: MESSAGES.DOWNLOAD_FAILURE,
      });
    }
  };

  if (tableData?.success && tableData.data?.tables?.length) {
    return (
      <div>
        <div className="flex flex-row flex-wrap max-h-svh">
          {tableData.data.tables.map((table) => {
            return (
              <div
                className="flex flex-auto p-4 m-2 bg-secondary min-w-min text-secondary-foreground "
                key={table._id.toString()}
              >
                {table.title}
              </div>
            );
          })}
        </div>
        <div className="flex flex-row ">
          <Button type="submit" size="lg" className="w-full">
            Download QR
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
      className="w-full max-w-xl px-4 mx-auto space-y-4"
    >
      <div className="flex items-center mb-6 space-x-2">
        <Switch
          id="bulk-creation"
          checked={isBulkCreation}
          onCheckedChange={setIsBulkCreation}
        />
        <Label htmlFor="bulk-creation">Bulk Table Creation</Label>
      </div>

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
          placeholder={PLACEHOLDERS.NUMBER_OF_TABLES}
          className="w-full"
          classInput={CLASS_INPUT}
          error={errors.numberOfTables?.message}
          {...register("numberOfTables")}
        />
      </div>
      {isBulkCreation ? (
        <div className="flex space-x-4">
          {/* <FormField
                  control={form.control}
                  name="startNumber"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Start Number</FormLabel>
                      <FormControl> */}
          <Field
            name="startNumber"
            type="number"
            min="1"
            {...register("startNumber")}
            className="w-full"
            classInput={CLASS_INPUT}
            placeholder={PLACEHOLDERS.START_NUMBER}
          />
          <Field
            name="endNumber"
            placeholder
            type="number"
            className="w-full"
            classInput={CLASS_INPUT}
            min="1"
            {...register("endNumber")}
          />
        </div>
      ) : (
        <Field
          name="startNumber"
          type="number"
          min="1"
          {...register("startNumber")}
          className="w-full"
          classInput={CLASS_INPUT}
          placeholder={PLACEHOLDERS.TABLE_NUMBER}
        />
      )}
      <div className="space-y-4">
        <Button type="submit" size="lg" className="w-full">
          {generatingQr ? (
            <div className="ring-loader" />
          ) : qrDataSuccess ? (
            "Next"
          ) : (
            "Generate QR"
          )}
        </Button>
        {qrDataSuccess && (
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={handleDownloadQr}
          >
            Download QR Codes
          </Button>
        )}
      </div>
    </form>
  );
};

export default CreateTablePage;
