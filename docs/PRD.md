# Product Requirements Document: RouteFlow

**Version:** 1.0  
**Date:** April 2026  
**Status:** Draft for Implementation  
**Project:** Order Management & Distribution Routing System

---

## 1. Executive Summary
RouteFlow is a real-time order management and distribution system designed to replace manual processes (WhatsApp, notebooks, phone calls). The system ensures that orders are entered once and are immediately visible to all stakeholders, from the order desk to the delivery drivers.

**Core Principle:** Any order received by any employee is entered directly into the system. No internal WhatsApp messages or duplicate entries.

---

## 2. User Roles & Permissions Matrix

| Role | Permissions | Platform |
| :--- | :--- | :--- |
| **Main Admin** | Full access: View/Update all, critical approvals, reports, system settings, audit logs. | Desktop + Mobile |
| **Deputy Admin** | View/Update orders, limited approvals (configurable). | Desktop + Mobile |
| **Order Desk** | Order entry and updates only. | Desktop |
| **Driver** | View assigned route, customer list, item summary, navigation. | Mobile Only |

*Note: Adding/Removing a customer requires "Four-Eyes" approval (Admin confirmation).*

---

## 3. Core Modules

### 3.1 Customer Management
- **Fields:** Name/Business, Unique ID (Auto), Delivery Days (Sun-Fri), Route Assignment, Sequence Order (Trip Index), Delivery Address (Geocoded), Waze/Google Maps Link, Contact Person, Phone, Status (Active/Paused/Inactive).
- **Inactivity Monitoring:** 
    - **Alert:** No order for 2 consecutive weeks triggers an Admin notification.
    - **v2 Feature:** 30% volume drop relative to the customer's average.

### 3.2 Product Catalog
- **Categories:**
    1. Fresh Eggs (L, M, XL, Jumbo, etc.)
    2. Pasteurized Liquid Eggs (Whole, Yolk, White)
    3. Hard-boiled Eggs (Packed/Bulk)
    4. Egg Powders
    5. Egg Substitutes (Vegan)
    6. Ready-to-Eat (Frozen Omelets)
    7. Prepared Foods
- **Fields:** SKU, Name, Image/Icon, Unit (e.g., Tray, KG), Price.

### 3.3 Order Management
- **Order Types:**
    - **Regular:** Standard delivery day.
    - **Future:** Scheduled for a future date (appears on the route sheet 1 day prior).
    - **Recurring (Template):** Automatic weekly order, editable until lock.
    - **Special:** One-off delivery on a non-standard day.
- **Status Indicators (Daily Sheet):**
    - **Green:** Confirmed order.
    - **Gray/Blurred:** Customer in route but no order today (excluded from driver sequence).
    - **Orange/Yellow:** Late additions (Post-14:00 lock).

---

## 4. Daily Workflow & Lifecycle

1. **Order Entry:** Real-time updates via WebSocket/SSE to all active screens.
2. **Lock Time (14:00):** 
    - Daily route sheet snapshots.
    - Automated **Picking Summary** generated (Per-route + Grand Total).
3. **Late Additions:** Orders after 14:00 are labeled "Late Addition #1, #2..." and highlighted in orange.
4. **Distribution (Morning):** 
    - Driver logs in via Mobile/PWA.
    - Views sorted customer list (Sequence Order).
    - One-tap "Open in Waze" for the delivery address.
    - Loading summary (Total items to load onto the truck).

---

## 5. Communications & Alerts
- **WhatsApp Integration:**
    - **Order Reminders:** Automated morning messages to Route Groups.
    - **Admin Alerts:** Inactivity, abnormal order volume, late additions.
- **System Notifications:**
    - In-app alerts for "Check-up" reminders and future-dated tasks.

---

## 6. Technical Requirements
- **Architecture:** Scalable Backend (Node.js/TypeScript), Real-time (Supabase/Socket.io), Frontend (Next.js/Tailwind).
- **Mobile:** PWA (Progressive Web App) for Driver accessibility.
- **Security:** RBAC (Role-Based Access Control), Audit Log for all critical mutations.
- **Integrations:** Waze (Deep Links), WhatsApp Business API / Twilio.

---

## 7. Implementation Roadmap

### Phase 1: MVP (Core Logistics)
- Customer/Product CRUD.
- Order Desk Entry (Desktop).
- 14:00 Locking logic & Picking Summary.
- Basic Driver Mobile View (Sorted list + Waze links).

### Phase 2: Automation & CRM
- WhatsApp Reminder Integration.
- Future-dated & Recurring orders.
- Inactivity Alerts.

### Phase 3: Analytics
- Sales performance graphs (Product/Customer/Route).
- Advanced volume-drop detection.

### Phase 4: Extended Ecosystem
- Inventory tracking.
- ERP/Invoicing integration (Invoices/Delivery Notes).

---

## 8. Open Questions
1. Is the 14:00 lock time global or configurable per route?
2. Are drivers using iOS or Android (Impacts PWA vs. Native)?
3. Does the system need to generate physical "Delivery Note" PDFs in Phase 1?
4. How are "Special Deliveries" handled if they don't fall into a predefined route?
