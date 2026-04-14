"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderItemSchema } from "@/lib/validations/order";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

const templateSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Template must have at least one item"),
});

type TemplateInput = z.infer<typeof templateSchema>;

interface OrderTemplateDialogProps {
  customerId: string;
  customerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderTemplateDialog({ customerId, customerName, open, onOpenChange }: OrderTemplateDialogProps) {
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      return res.json();
    },
  });

  const { data: currentTemplate, isLoading } = useQuery({
    queryKey: ["template", customerId],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${customerId}/template`);
      return res.json();
    },
    enabled: open,
  });

  const form = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
    },
    values: currentTemplate ? {
      items: currentTemplate.items.map((i: any) => ({
        productId: i.productId,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    } : undefined,
  });

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  const saveTemplate = useMutation({
    mutationFn: async (data: TemplateInput) => {
      const res = await fetch(`/api/customers/${customerId}/template`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save template");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Order template saved");
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Weekly Order Template: {customerName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div>Loading template...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => saveTemplate.mutate(data))} className="space-y-4">
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index === 0 ? "block" : "sr-only"}>Product</FormLabel>
                            <Select 
                              onValueChange={(val) => {
                                field.onChange(val);
                                const p = products?.find((p: any) => p.id === val);
                                if (p) form.setValue(`items.${index}.unitPrice`, Number(p.price));
                              }} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products?.map((p: any) => (
                                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="w-20">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index === 0 ? "block" : "sr-only"}>Qty</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
                <Button type="submit" disabled={saveTemplate.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
