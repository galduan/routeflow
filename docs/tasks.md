# RouteFlow: Implementation Task List

This document breaks down the development into actionable sprints for a full-stack engineering team.

---

## Sprint 1: Infrastructure, Auth & Core Catalogs
*Goal: Establish the platform foundations and basic data entry for Products and Customers.*

### 1.1 Project Scaffolding
- [ ] Initialize Next.js project with TypeScript and Tailwind CSS.
- [ ] Set up Database (PostgreSQL) and ORM (Prisma).
- [ ] Configure Environment Variables and CI/CD basics.

### 1.2 Authentication & RBAC
- [ ] Implement Auth (NextAuth.js or Supabase Auth).
- [ ] Define roles: `ADMIN`, `DEPUTY`, `ORDER_DESK`, `DRIVER`.
- [ ] Create middleware for route protection based on roles.

### 1.3 Product Catalog
- [ ] API: CRUD endpoints for Products (SKU, Category, Unit, Price, Image).
- [ ] UI: Product list and "Add/Edit Product" modal.
- [ ] Implement Category filtering.

### 1.4 Customer Management
- [ ] API: CRUD endpoints for Customers (Delivery Days, Route, Sequence).
- [ ] UI: Customer Management table with search and filtering.
- [ ] Integration: Address Geocoding (Google Maps API) for coordinates and Waze links.

### 1.5 Route Setup
- [ ] API: CRUD for Routes (Name, Default Driver, Activity Days).
- [ ] UI: Assign customers to routes via drag-and-drop sequence ordering.

---

## Sprint 2: Order Entry & Real-time Dashboard
*Goal: Enable the Order Desk to enter data and see real-time updates.*

### 2.1 Core Ordering System
- [ ] API: Create/Update Order and OrderItems.
- [ ] UI: "New Order" interface with real-time product search and quantity selection.
- [ ] Logic: Prevent orders on non-delivery days (unless marked "Special").

### 2.2 Real-time Daily Dashboard
- [ ] UI: Desktop grid showing all routes and their orders for the selected date.
- [ ] Integration: Implement WebSockets or Supabase Realtime for instant order visibility.
- [ ] UI: Visual status indicators (Green for confirmed, Gray for no order).

### 2.3 Recurring Order Templates
- [ ] API: Logic to generate "Draft" orders based on customer templates.
- [ ] UI: Manage recurring templates in the Customer Profile.

---

## Sprint 3: Locking & Driver Logistics
*Goal: Automate the 14:00 lock and provide the Driver's mobile interface.*

### 3.1 Order Locking Logic
- [ ] Background Job: Trigger status update to "LOCKED" at 14:00 daily.
- [ ] Logic: Automatically flag orders created after 14:00 as `LATE_ADDITION`.
- [ ] UI: Indicator for "Late Addition #1, #2" with orange highlighting.

### 3.2 Picking & Loading Summaries
- [ ] API: Endpoint to aggregate quantities of all products per route.
- [ ] UI: "Picking List" view for warehouse staff (Aggregate view).
- [ ] UI: "Total Load" view for Drivers.

### 3.3 Driver Mobile View (PWA)
- [ ] UI: Mobile-responsive list of stops for the assigned route.
- [ ] Integration: "Open in Waze" and "Call Customer" buttons.
- [ ] Action: "Mark as Delivered" with timestamp.

---

## Sprint 4: Notifications & CRM
*Goal: Close the loop with reminders and inactivity tracking.*

### 4.1 WhatsApp Integration
- [ ] Logic: Generator for WhatsApp reminder links (`wa.me`) with pre-filled text.
- [ ] UI: "Send Reminders" button for Order Desk (per route).

### 4.2 Monitoring & Alerts
- [ ] Logic: Identify customers with no orders for > 14 days.
- [ ] UI: "Alerts" center for Admins showing inactivity and volume drops.

### 4.3 Audit Logging
- [ ] API: Middleware to log all mutations to a `audit_logs` table.
- [ ] UI: View history of changes for a specific order or customer.

---

## Sprint 5: Refinement & Launch
*Goal: Final testing and deployment.*

- [ ] End-to-end testing of the 14:00 lock transition.
- [ ] Mobile PWA testing on iOS and Android.
- [ ] Final RTL/LTR UI polish.
- [ ] Production deployment and database migration.
