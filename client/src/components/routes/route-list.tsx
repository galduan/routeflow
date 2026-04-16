"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
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
import { User, Users, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Route {
  id: string;
  name: string;
  driver?: { name: string };
  activityDays: number[];
  _count: { customers: number };
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function RouteList() {
  const { data: routes, isLoading } = useQuery<Route[]>({
    queryKey: ["routes"],
    queryFn: async () => {
      const res = await api.get("/api/routes");
      return res.data;
    },
  });

  const sendWhatsAppReminders = async (routeId: string) => {
    try {
      const res = await api.get(`/api/routes/${routeId}/reminder`);
      const { message, recipients } = res.data;

      if (!recipients.length) {
        toast.error("No active customers on this route");
        return;
      }

      // In MVP, we'll open the first one and show a toast
      const first = recipients[0];
      const url = `https://wa.me/${first.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
      
      toast.info(`Opening WhatsApp for ${first.name}. (${recipients.length} total)`);
    } catch (err) {
      toast.error("Failed to generate reminder");
    }
  };

  if (isLoading) return <div>Loading routes...</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Route Name</TableHead>
            <TableHead>Assigned Driver</TableHead>
            <TableHead>Activity Days</TableHead>
            <TableHead>Customers Count</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes?.map((route) => (
            <TableRow key={route.id}>
              <TableCell className="font-medium">{route.name}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1 text-muted-foreground" />
                  {route.driver?.name || "Unassigned"}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {route.activityDays.sort().map((day) => (
                    <Badge key={day} variant="outline" className="text-[10px] px-1">
                      {DAYS[day]}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                  {route._count.customers}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700"
                    onClick={() => sendWhatsAppReminders(route.id)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" /> WhatsApp
                  </Button>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {routes?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No routes configured.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
