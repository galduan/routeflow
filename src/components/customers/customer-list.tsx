"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, MapPin, RefreshCw } from "lucide-react";
import { OrderTemplateDialog } from "./order-template-dialog";

interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  route: { name: string };
  deliveryDays: number[];
  isActive: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CustomerList() {
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null);

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await fetch("/api/customers");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading customers...</div>;

  return (
    <>
      <OrderTemplateDialog
        open={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
        customerId={selectedCustomer?.id || ""}
        customerName={selectedCustomer?.name || ""}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Delivery Days</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <div>
                    {customer.name}
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {customer.address}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{customer.route?.name || "Unassigned"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {customer.deliveryDays.sort().map((day) => (
                      <Badge key={day} variant="outline" className="text-[10px] px-1">
                        {DAYS[day]}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  <Badge variant={customer.isActive ? "default" : "secondary"}>
                    {customer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Manage Weekly Template"
                      onClick={() => setSelectedCustomer({ id: customer.id, name: customer.name })}
                    >
                      <RefreshCw className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {customers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
