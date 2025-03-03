import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Table title must be at least 2 characters.",
  }),
  capacity: z.string().min(1, {
    message: "Capacity is required.",
  }),
});

export function AddTableDialog({ children }) {
  const [open, setOpen] = useState(false);

  // const form =
  //   useForm <
  //   z.infer <
  //   typeof formSchema >>
  //     {
  //       resolver: zodResolver(formSchema),
  //       defaultValues: {
  //         title: "",
  //         capacity: "",
  //       },
  //     };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      capacity: "",
    },
  });

  function onSubmit(values) {
    console.log(values);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Table</DialogTitle>
          <DialogDescription>
            Add a new table to your restaurant. Click save when you{"'"}re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., A-1, B-2" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the unique identifier for the table.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 4" {...field} />
                  </FormControl>
                  <FormDescription>
                    The number of people this table can accommodate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Table</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
