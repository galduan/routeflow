# RouteFlow: Technical Specifications

## 1. Database Schema (Prisma / PostgreSQL)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  DEPUTY
  ORDER_DESK
  DRIVER
}

enum OrderStatus {
  DRAFT
  LOCKED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}

enum OrderType {
  REGULAR
  FUTURE
  RECURRING
  SPECIAL
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          Role      @default(ORDER_DESK)
  routes        Route[]   // Routes assigned to this user (if driver)
  auditLogs     AuditLog[]
}

model Product {
  id          String      @id @default(cuid())
  sku         String      @unique
  name        String
  category    String
  unit        String      // e.g., "Tray", "KG"
  price       Decimal
  imageUrl    String?
  isActive    Boolean     @default(true)
  orderItems  OrderItem[]
}

model Route {
  id              String     @id @default(cuid())
  name            String
  driverId        String?
  driver          User?      @relation(fields: [driverId], references: [id])
  activityDays    Int[]      // Array of days [0-6]
  customers       Customer[]
}

model Customer {
  id               String   @id @default(cuid())
  name             String
  address          String
  lat              Float?
  lng              Float?
  phone            String
  contactPerson    String?
  routeId          String
  route            Route    @relation(fields: [routeId], references: [id])
  sequenceOrder    Int      // Position in the route
  deliveryDays     Int[]    // Array of days [0-6]
  isActive         Boolean  @default(true)
  orders           Order[]
}

model Order {
  id             String      @id @default(cuid())
  customerId     String
  customer       Customer    @relation(fields: [customerId], references: [id])
  deliveryDate   DateTime
  status         OrderStatus @default(DRAFT)
  type           OrderType   @default(REGULAR)
  isLateAddition Boolean     @default(false)
  lateSequence   Int?        // 1, 2, 3 for "Late Addition #X"
  totalPrice     Decimal
  items          OrderItem[]
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  createdBy      String
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Decimal
  unitPrice Decimal
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  action     String   // "CREATE", "UPDATE", "DELETE", "LOCK"
  entityType String   // "ORDER", "CUSTOMER", etc.
  entityId   String
  changes    Json?    // Diff of changes
  timestamp  DateTime @default(now())
}
```

---

## 2. Core API Endpoints

### Auth
- `POST /api/auth/login` - Authenticate user.
- `GET /api/auth/me` - Get current session.

### Customers & Products
- `GET /api/customers` - List all customers with search/filter.
- `POST /api/customers` - Create a new customer (Admin only).
- `GET /api/products` - List active product catalog.
- `PATCH /api/products/:id` - Update price/status.

### Orders
- `GET /api/orders?date=YYYY-MM-DD` - View all orders for a specific day.
- `POST /api/orders` - Create a new order.
- `PATCH /api/orders/:id` - Update order items/status.
- `POST /api/orders/bulk-lock` - Manual lock for a route (Admin/Deputy).

### Logistics (Daily Sheets)
- `GET /api/routes/:id/sheet?date=...` - Get the daily sequence for a route.
- `GET /api/routes/:id/picking-summary?date=...` - Aggregated load list.

### Driver App
- `GET /api/driver/my-route` - Get today's sequence for the authenticated driver.
- `PATCH /api/orders/:id/status` - Mark as delivered/out-for-delivery.

### Alerts
- `GET /api/alerts/inactivity` - Get customers with no orders in 14 days.
- `GET /api/alerts/volume-drop` - Get customers with >30% drop in volume.
