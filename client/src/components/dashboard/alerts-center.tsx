"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, UserX, TrendingDown } from "lucide-react";

export function AlertsCenter() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await api.get("/api/alerts");
      return res.data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  if (isLoading) return <div className="animate-pulse h-20 bg-muted rounded-lg"></div>;
  if (!alerts?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {alerts.map((alert: any, idx: number) => (
        <Card key={idx} className={`border-l-4 ${alert.severity === 'HIGH' ? 'border-l-destructive' : 'border-l-amber-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {alert.type === 'INACTIVITY' ? 'Inactivity Alert' : 'Volume Drop'}
            </CardTitle>
            {alert.type === 'INACTIVITY' ? (
              <UserX className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingDown className="h-4 w-4 text-amber-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{alert.customerName}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {alert.message}
            </p>
            <div className="mt-3">
              <Badge variant={alert.severity === 'HIGH' ? 'destructive' : 'outline'}>
                {alert.severity} PRIORITY
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
