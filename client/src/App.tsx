import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductList } from "@/components/products/product-list";
import { CustomerList } from "@/components/customers/customer-list";
import { RouteList } from "@/components/routes/route-list";
import { OrderDialog } from "@/components/orders/order-dialog";
import { DailyOrders } from "@/components/orders/daily-orders";
import { PickingList } from "@/components/reports/picking-list";
import { DriverView } from "@/components/driver/driver-view";
import { AlertsCenter } from "@/components/dashboard/alerts-center";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, LayoutDashboard, Truck } from "lucide-react";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

function Dashboard() {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [view, setView] = useState<"admin" | "driver">("admin");

  if (view === "driver") {
    return (
      <main className="bg-muted/30 min-h-screen">
        <div className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10">
          <h1 className="font-bold text-primary italic">RouteFlow <span className="text-muted-foreground font-normal not-italic text-sm">Driver</span></h1>
          <Button variant="ghost" size="sm" onClick={() => setView("admin")}>
            <LayoutDashboard className="h-4 w-4 mr-2" /> Admin
          </Button>
        </div>
        <DriverView />
        <Toaster />
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RouteFlow</h1>
          <p className="text-muted-foreground">Order Management & Distribution Dashboard</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setView("driver")}>
            <Truck className="mr-2 h-4 w-4" />
            Driver View
          </Button>
          <Button onClick={() => setIsOrderDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      <OrderDialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen} />

      <AlertsCenter />

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="orders">Daily Orders</TabsTrigger>
          <TabsTrigger value="picking">Picking List</TabsTrigger>
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

        <TabsContent value="picking" className="space-y-4">
          <PickingList />
        </TabsContent>
      </Tabs>
      <Toaster />
    </main>
  );
}

function App() {
  return (
    <QueryProvider>
      <Dashboard />
    </QueryProvider>
  );
}

export default App;
