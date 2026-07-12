# TransitOps: Comprehensive System Architecture & Implementation Plan

## 1. Project Specifications

- **Duration:** 8 Hours
- **Objective:** Build an end-to-end transport operations platform to manage the complete lifecycle of transport operations (vehicle registration, driver management, dispatching, maintenance, fuel logging, and analytics).
- **Goal:** Digitize operations to resolve scheduling conflicts, vehicle underutilization, missed maintenance, expired licenses, and inaccurate expense tracking caused by spreadsheet reliance.

---

## 2. Technical Stack Implementation

- **Framework:** SvelteKit (App routing, SSR, Form Actions).
- **State Management:** Svelte 5 Runes (`$state`, `$derived`, `$props`).
- **Database & Auth:** Supabase (PostgreSQL, Email/Password Auth, SSR Cookie mapping).
- **ORM:** Drizzle ORM (Type-safe schemas, Migrations).
- **Deployment:** Vercel (Edge-optimized).

---

## 3. Role-Based Access Control (RBAC) & Users

Secure login via email/password is mandatory. Unauthenticated access is blocked.

- **Fleet Manager:** Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency.
- **Driver:** Creates trips, assigns vehicles and drivers, and monitors active deliveries.
- **Safety Officer:** Ensures driver compliance, tracks license validity, and monitors safety scores.
- **Financial Analyst:** Reviews operational expenses, fuel consumption, maintenance costs, and profitability.

---

## 4. Data Models & Enums

### 4.1 Vehicles

- **Fields:** Registration Number (Unique), Name/Model, Type, Maximum Load Capacity, Odometer, Acquisition Cost.
- **Status Enum:** `Available`, `On Trip`, `In Shop`, `Retired`.

### 4.2 Drivers

- **Fields:** Name, License Number, License Category, License Expiry Date, Contact Number, Safety Score.
- **Status Enum:** `Available`, `On Trip`, `Off Duty`, `Suspended`.

### 4.3 Trips

- **Fields:** Source, Destination, Vehicle ID, Driver ID, Cargo Weight, Planned Distance.
- **Lifecycle Enum:** `Draft` $\rightarrow$ `Dispatched` $\rightarrow$ `Completed` OR `Cancelled`.

### 4.4 Maintenance & Expenses

- **Maintenance Logs:** Vehicle ID, Description, Status, Date.
- **Expenses:** Record fuel logs (liters, cost, date) and other expenses (tolls, maintenance).

---

## 5. Mandatory Business Logic & Validation

All constraints must be enforced via server-side validation.

### Data Integrity

1. Vehicle registration numbers must be strictly unique.
2. Cargo Weight validation: $\text{Cargo Weight} \le \text{Maximum Load Capacity}$.

### Dispatch Constraints

3. Vehicles marked `Retired` or `In Shop` must be hidden from dispatch selection pools.
4. Drivers with expired licenses or `Suspended` status cannot be assigned to trips.
5. Drivers or vehicles currently marked `On Trip` cannot be assigned to new trips.

### Automated State Transitions

6. **Dispatch:** Triggering a trip dispatch forces both the Vehicle and Driver status to `On Trip`.
7. **Completion:** Completing a trip (requires final odometer and fuel entry) restores Vehicle and Driver status to `Available`.
8. **Cancellation:** Cancelling a dispatched trip restores Vehicle and Driver to `Available`.
9. **Maintenance Start:** Creating an active maintenance record forces the Vehicle status to `In Shop`.
10. **Maintenance End:** Closing a maintenance record restores the Vehicle to `Available` (unless marked `Retired`).

---

## 6. Dashboard & Analytics

### Metrics & KPIs

- **Core KPIs:** Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty.
- **Total Operational Cost:** $\sum \text{Fuel Cost} + \sum \text{Maintenance Cost}$ per vehicle.
- **Fuel Efficiency:** Calculated dynamically based on latest logs: $\frac{\text{Distance}}{\text{Fuel Consumed}}$.
- **Fleet Utilization:** Displayed as a percentage.
- **Vehicle ROI Formulation:**
  $$\text{ROI} = \frac{\text{Revenue} - (\text{Maintenance} + \text{Fuel})}{\text{Acquisition Cost}}$$

### Reporting Features

- Support global filtering by vehicle type, status, and region.
- Mandatory CSV export functionality.

---

## 7. Deliverables Checklist

### Mandatory

- [ ] Responsive web interface
- [ ] Authentication with RBAC
- [ ] CRUD for Vehicles and Drivers
- [ ] Trip Management with server-side validations
- [ ] Automatic status transitions (Triggers)
- [ ] Maintenance workflow
- [ ] Fuel & Expense tracking
- [ ] Dashboard with KPIs

### Bonus Features (Implement if time permits)

- [ ] Charts and visual analytics
- [ ] PDF export for reports
- [ ] Email reminders for expiring driver licenses
- [ ] Vehicle document management uploads
- [ ] Advanced search, filters, and sorting
- [ ] Dark mode UI toggle
