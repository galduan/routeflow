"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, Phone, CheckCircle2, MapPin } from "lucide-react";
import { toast } from "sonner";

export function DriverView() {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  // In a real app, we'd fetch based on the logged-in driver's ID
  const { data: orders, isLoading } = useQuery({
    queryKey: ["driver-orders", today],
    queryFn: async () => {
      const res = await api.get(`/api/orders?date=${today}`);
      return res.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      // For now, we'll simulate this endpoint
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-orders"] });
      toast.success("Status updated");
    },
  });

  const openWaze = (address: string) => {
    const url = `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
    window.open(url, "_blank");
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading your route...</div>;

  // Filter out non-ordered customers and sort by sequence (simulated)
  const myOrders = orders?.filter((o: any) => o.status !== "CANCELLED") || [];

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20">
      <div className="px-4 pt-4">
        <h2 className="text-xl font-bold">Today's Route</h2>
        <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMM do")}</p>
      </div>

      {!myOrders.length && (
        <Card className="mx-4 mt-10 border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            No deliveries scheduled for today.
          </CardContent>
        </Card>
      )}

      {myOrders.map((order: any, index: number) => (
        <Card key={order.id} className={`mx-4 border-l-4 ${order.status === 'DELIVERED' ? 'border-l-green-500 opacity-75' : 'border-l-blue-500'}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <Badge variant="outline" className="mb-2">Stop #{index + 1}</Badge>
              {order.status === 'DELIVERED' && (
                <Badge className="bg-green-500">Delivered</Badge>
              )}
            </div>
            <CardTitle className="text-lg">{order.customer.name}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {order.customer.address}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="bg-muted/30 rounded p-3 mb-4 text-sm">
              <p className="font-semibold mb-1">Items:</p>
              <ul className="list-disc list-inside">
                {order.items.map((i: any) => (
                  <li key={i.id}>{i.quantity} {i.product.unit} {i.product.name}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => openWaze(order.customer.address)}>
                <Navigation className="h-4 w-4 mr-1" /> Waze
              </Button>
              <a href={`tel:${order.customer.phone}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="h-4 w-4 mr-1" /> Call
                </Button>
              </a>
              <Button 
                size="sm" 
                disabled={order.status === 'DELIVERED'}
                onClick={() => updateStatus.mutate({ id: order.id, status: 'DELIVERED' })}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" /> Done
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
