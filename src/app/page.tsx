"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductList } from "@/components/products/product-list";
import { CustomerList } from "@/components/customers/customer-list";
import { RouteList } from "@/components/routes/route-list";
import { OrderDialog } from "@/components/orders/order-dialog";
import { DailyOrders } from "@/components/orders/daily-orders";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function DashboardPage() {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RouteFlow</h1>
          <p className="text-muted-foreground">Order Management & Distribution Dashboard</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setIsOrderDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      <OrderDialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen} />

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="orders">Daily Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Product Catalog</CardTitle>
                <CardDescription>Manage your eggs, SKUs, and pricing.</CardDescription>
              </div>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </CardHeader>
            <CardContent>
              <ProductList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>View and manage client delivery schedules and routes.</CardDescription>
              </div>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </CardHeader>
            <CardContent>
              <CustomerList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Distribution Routes</CardTitle>
                <CardDescription>Configure routes, drivers, and delivery frequencies.</CardDescription>
              </div>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Route
              </Button>
            </CardHeader>
            <CardContent>
              <RouteList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Distribution</CardTitle>
              <CardDescription>Real-time order monitoring and route tracking.</CardDescription>
            </CardHeader>
            <CardContent>
              <DailyOrders />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
