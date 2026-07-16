import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useGenerateTableQrMutation } from "api/tableApi";

import { Button } from "components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "components/ui/form";
import { Input } from "components/ui/input";
import { Switch } from "components/ui/switch";
import { errorToast, successToast } from "lib/helper";
import { ButtonSpinner } from "components/Spinner";

const MAX_CAPACITY = 50;
const MAX_BULK = 50;

const formSchema = z
  .object({
    prefixOfTables: z.string().min(1, "Prefix is required"),
    startNumber: z.number().min(1, "Start number must be at least 1"),
    endNumber: z.number().min(1, "End number must be at least 1"),
    capacity: z
      .number()
      .min(1, "Capacity must be at least 1")
      .max(MAX_CAPACITY, `Capacity can't exceed ${MAX_CAPACITY}`),
    isBulkCreation: z.boolean().default(false),
  })
  .refine((data) => !data.isBulkCreation || data.endNumber > data.startNumber, {
    message: "The end number must be greater than the start number.",
    path: ["endNumber"],
  })
  .refine(
    (data) =>
      !data.isBulkCreation ||
      data.endNumber - data.startNumber + 1 <= MAX_BULK,
    {
      message: `You can create up to ${MAX_BULK} tables at once.`,
      path: ["endNumber"],
    }
  );

export function AddTableDialog({ children }) {
  const [open, setOpen] = useState(false);

  const [generateTableQr, { isLoading: generatingQr }] =
    useGenerateTableQrMutation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prefixOfTables: "",
      startNumber: 1,
      endNumber: 1,
      capacity: 4,
      isBulkCreation: false,
    },
  });

  const { handleSubmit, reset, control, watch } = form;

  const isBulkCreation = watch("isBulkCreation");
  const prefix = watch("prefixOfTables");
  const startNumber = watch("startNumber");
  const endNumber = watch("endNumber");

  const count =
    isBulkCreation && endNumber >= startNumber
      ? endNumber - startNumber + 1
      : 1;

  const preview =
    prefix && startNumber
      ? isBulkCreation && count > 1
        ? `Creates ${prefix.toUpperCase()}${startNumber}–${prefix.toUpperCase()}${endNumber} (${count} tables)`
        : `Creates ${prefix.toUpperCase()}${startNumber}`
      : null;

  async function onSubmit(data) {
    const payload = {
      letter: data.prefixOfTables.toLowerCase(),
      startTable: data.startNumber,
      endTable: data.isBulkCreation ? data.endNumber : data.startNumber,
      capacity: data.capacity,
      bulkCreate: data.isBulkCreation,
    };

    try {
      const response = await generateTableQr(payload).unwrap();
      successToast({
        data: response,
        message: "Tables and QR codes created",
      });
      reset();
      setOpen(false);
    } catch (error) {
      errorToast({
        error,
        message: "Failed to create tables, please try again",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add tables</DialogTitle>
          <DialogDescription>
            Create a single table or a numbered range in one go.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="prefixOfTables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table prefix</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. A" maxLength={3} {...field} />
                  </FormControl>
                  <FormDescription>
                    Tables are named prefix + number (e.g. A1, A2).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="isBulkCreation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <FormLabel>Create a range</FormLabel>
                    <FormDescription>
                      Add several numbered tables at once.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {isBulkCreation ? (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="startNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="endNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <FormField
                control={control}
                name="startNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seats per table</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={MAX_CAPACITY}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {preview && (
              <p className="text-sm text-muted-foreground">{preview}</p>
            )}
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={generatingQr}
                type="submit"
                className="min-w-32"
              >
                {generatingQr ? (
                  <ButtonSpinner />
                ) : count > 1 ? (
                  `Add ${count} tables`
                ) : (
                  "Add table"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
