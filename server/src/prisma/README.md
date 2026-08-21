# PostgreSQL Database Configuration & Migration Guide

This directory contains the Prisma schema, migrations, and seed script for the **GK Event Management System** PostgreSQL database layer.

---

## 1. Local PostgreSQL Setup

### Prerequisites
* Install PostgreSQL (v15 or higher).
* Ensure the PostgreSQL service is running on port `5432`.

### Environment Configuration
Create or update the `.env` file in the `server` directory with your PostgreSQL connection URL:

```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/gk_events?schema=public"
```

* Replace `<username>` and `<password>` with your PostgreSQL superuser credentials.
* Default local URL for development (using password `12345678`):
  `DATABASE_URL="postgresql://postgres:12345678@localhost:5432/gk_events?schema=public"`

---

## 2. Relationships Overview

The diagram below details how the schema entities are related across the 20 core modules:

```mermaid
erDiagram
    User ||--o| Customer : "has profile"
    User ||--o| Employee : "has profile"
    User ||--o{ AuditLog : "creates"
    User ||--o{ OtpVerification : "receives"

    Customer ||--o{ Event : "books"
    Customer ||--o{ Booking : "owns"
    Customer ||--o{ Quotation : "receives"
    Customer ||--o{ Payment : "makes"
    Customer ||--o{ Invoice : "billed by"
    Customer ||--o{ TravelBooking : "registers"

    Event ||--o| Booking : "has"
    Event ||--o{ EventPlan : "contains"
    Event ||--o{ EventTimeline : "scheduled by"
    Event ||--o{ Task : "includes"
    Event ||--o{ HallBooking : "associates"
    Event ||--o{ TravelBooking : "involves"
    Event ||--o{ CalendarEvent : "represented on"
    Event ||--o{ Quotation : "linked to"

    Booking ||--o{ Payment : "has"
    Booking ||--o{ Invoice : "generates"

    Quotation ||--o{ QuotationItem : "comprises"
    QuotationItem }|--o| Vendor : "supplied by"

    Vendor ||--o{ VendorService : "offers"

    InventoryItem ||--o{ InventoryTransaction : "has history"

    Employee ||--o{ Task : "assigned to"
    Employee ||--o{ EventPlan : "coordinates"
    Employee ||--o{ CalendarEvent : "attends"

    Hall ||--o{ HallBooking : "hosts"
    
    Task ||--o{ CalendarEvent : "scheduled on"
```

---

## 3. Migration Commands

### Create a Database Migration
Run this command in the `server` directory when schema changes are made to generate and apply a SQL migration locally:
```bash
npx prisma migrate dev --name <migration_name> --schema=src/prisma/schema.prisma
```

### Apply Migrations in Production / CI
To apply pending migrations without creating new ones (e.g., during deployments to Render/production):
```bash
npx prisma migrate deploy --schema=src/prisma/schema.prisma
```

### Generate Prisma Client
Generate the client types after modifying the schema:
```bash
npx prisma generate --schema=src/prisma/schema.prisma
```

---

## 4. Seeding Data

Populate the database with default roles, credentials, and test events:
```bash
npx prisma db seed
```

This creates:
* **Admin Account:** `admin@gkevents.com` / `admin123`
* **Employee Account:** `employee@gkevents.com` / `employee123`
* **Normal Customer:** `customer@gkevents.com` / `password123`
* A default Function Hall (`Taj Mahal Grand Ballroom`), a sample event booking, inventory items, vendors, and food menu items.

---

## 5. Troubleshooting & Resets

If you need to drop all tables and completely recreate the database structure:
```bash
npx prisma migrate reset --schema=src/prisma/schema.prisma
```
*(Warning: This deletes all data and re-runs all migrations and the seed script.)*
