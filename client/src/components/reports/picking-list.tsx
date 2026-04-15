"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, Truck } from "lucide-react";

export function PickingList() {
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: summary, isLoading } = useQuery({
    queryKey: ["picking-summary", today],
    queryFn: async () => {
      const res = await api.get(`/api/reports/picking?date=${today}`);
      return res.data;
    },
  });

  if (isLoading) return <div className="p-8 text-center">Generating picking lists...</div>;

  return (
    <div className="space-y-8">
      {/* 1. Grand Total Picking List */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Warehouse Picking List (Grand Total)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Product Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right pr-6">Total Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(summary?.grandTotal || {}).map(([id, item]: any) => (
                <TableRow key={id}>
                  <TableCell className="font-semibold pl-6">{item.name}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right pr-6 text-lg font-bold text-primary">
                    {item.total}
                  </TableCell>
                </TableRow>
              ))}
              {!Object.keys(summary?.grandTotal || {}).length && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No orders to pick for today.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 2. Route Loading Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(summary?.byRoute || {}).map(([id, route]: any) => (
          <Card key={id}>
            <CardHeader className="py-3 px-4 bg-muted/30">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Route: {route.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {Object.entries(route.products).map(([pid, p]: any) => (
                    <TableRow key={pid}>
                      <TableCell className="text-sm py-2">{p.name}</TableCell>
                      <TableCell className="text-right py-2 font-mono font-bold">
                        {p.total} <span className="text-[10px] text-muted-foreground uppercase">{p.unit}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
