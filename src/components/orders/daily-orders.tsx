"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Truck, AlertCircle } from "lucide-react";

interface Order {
  id: string;
  deliveryDate: string;
  status: string;
  totalPrice: number;
  isLateAddition: boolean;
  customer: {
    name: string;
    route: { name: string };
  };
  items: Array<{
    quantity: number;
    product: { name: string; unit: string };
  }>;
}

const STATUS_ICONS: Record<string, any> = {
  DRAFT: <Clock className="h-4 w-4 text-muted-foreground" />,
  LOCKED: <AlertCircle className="h-4 w-4 text-amber-500" />,
  OUT_FOR_DELIVERY: <Truck className="h-4 w-4 text-blue-500" />,
  DELIVERED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

export function DailyOrders() {
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders", today],
    queryFn: async () => {
      const res = await fetch(`/api/orders?date=${today}`);
      return res.json();
    },
    // In Sprint 2, we simulate real-time with short polling
    refetchInterval: 5000,
  });

  if (isLoading) return <div className="p-8 text-center">Loading today's orders...</div>;

  // Group by route
  const ordersByRoute = orders?.reduce((acc, order) => {
    const routeName = order.customer.route?.name || "Unassigned";
    if (!acc[routeName]) acc[routeName] = [];
    acc[routeName].push(order);
    return acc;
  }, {} as Record<string, Order[]>) || {};

  return (
    <div className="space-y-6">
      {Object.entries(ordersByRoute).map(([routeName, routeOrders]) => (
        <Card key={routeName} className={routeName === "Unassigned" ? "border-dashed" : ""}>
          <CardHeader className="py-3 px-4 bg-muted/20">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              Route: {routeName}
              <Badge variant="outline">{routeOrders.length} Orders</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] pl-4">Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right pr-4">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routeOrders.map((order) => (
                  <TableRow key={order.id} className={order.isLateAddition ? "bg-amber-50/50" : ""}>
                    <TableCell className="font-medium pl-4">
                      {order.customer.name}
                      {order.isLateAddition && (
                        <span className="ml-2 text-[10px] bg-amber-200 text-amber-800 px-1 rounded font-bold">LATE</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {STATUS_ICONS[order.status]}
                        <span className="text-xs capitalize">{order.status.toLowerCase().replace(/_/g, " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {order.items.map(i => `${i.quantity} ${i.product.unit} ${i.product.name}`).join(", ")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-4 font-mono">
                      ${Number(order.totalPrice).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
      
      {orders?.length === 0 && (
        <div className="text-center py-20 bg-muted/10 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">No orders received yet for today.</p>
        </div>
      )}
    </div>
  );
}
