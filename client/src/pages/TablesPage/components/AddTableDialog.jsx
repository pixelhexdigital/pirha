import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useGenerateTableQrMutation } from "api/tableApi";

import { Button } from "components/ui/button";
import {
  Dialog,
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

const formSchema = z
  .object({
    prefixOfTables: z.string().min(1, "Prefix is required"),
    startNumber: z.number().min(1, "Start number must be at least 1"),
    endNumber: z.number().min(1, "End number must be at least 1"),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    isBulkCreation: z.boolean().default(false),
  })
  .refine((data) => !data.isBulkCreation || data.endNumber > data.startNumber, {
    message:
      "For bulk creation, the end number must be greater than the start number.",
    path: ["endNumber"],
  });

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
        message: "Table and QR codes generated successfully",
      });
      reset();
      setOpen(false);
    } catch (error) {
      errorToast({
        error,
        message: "Failed to generate table QR codes, please try again",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Table(s)</DialogTitle>
          <DialogDescription>
            Create a new table or bulk create multiple tables.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="prefixOfTables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Prefix</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., A, B, C" {...field} />
                  </FormControl>
                  <FormDescription>
                    The prefix for the table number(s).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="isBulkCreation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Bulk Creation</FormLabel>
                    <FormDescription>
                      Enable to create multiple tables at once.
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
              <>
                <FormField
                  control={control}
                  name="startNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
                      <FormLabel>End Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
              </>
            ) : (
              <FormField
                control={control}
                name="startNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                disabled={generatingQr}
                type="submit"
                className="min-w-32"
              >
                {generatingQr ? (
                  <div className="ring-loader size-5" />
                ) : (
                  "Add Table(s)"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
