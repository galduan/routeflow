"use client";

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
import { User, Users } from "lucide-react";

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
      const res = await fetch("/api/routes");
      return res.json();
    },
  });

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
                <Button variant="outline" size="sm">Manage</Button>
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
