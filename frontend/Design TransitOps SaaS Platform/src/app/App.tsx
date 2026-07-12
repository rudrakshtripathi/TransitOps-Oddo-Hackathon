import React, { useState, useMemo } from "react";
import {
  LayoutDashboard, Truck, Users, Navigation, Wrench, Fuel,
  BarChart3, Settings, Bell, Search, Moon, Sun, Menu, X,
  ChevronRight, ArrowUpRight, ArrowDownRight, Plus, Edit2,
  Trash2, Download, CheckCircle, XCircle, Clock, AlertTriangle,
  LogOut, User, DollarSign, TrendingUp, TrendingDown, Check,
  ChevronDown, MapPin, Activity, Shield, Eye, EyeOff,
  Star, CreditCard, Car, RefreshCw, Filter, MoreVertical,
  FileText, Layers, Zap, AlertCircle
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

// ─────────────────────── TYPES ───────────────────────
type View = "dashboard" | "vehicles" | "drivers" | "trips" | "maintenance" | "fuel" | "analytics" | "settings";
type Role = "admin" | "manager" | "driver";

// ─────────────────────── MOCK DATA ───────────────────────
const VEHICLES_DATA = [
  { id: "V001", plate: "KAA 123A", make: "Toyota", model: "Coaster", year: 2022, type: "Bus", capacity: 30, status: "active", driver: "James Mwangi", mileage: 48200, fuel: "Diesel", lastService: "2025-11-15" },
  { id: "V002", plate: "KBC 456B", make: "Isuzu", model: "NPR", year: 2021, type: "Truck", capacity: 5, status: "active", driver: "Grace Odhiambo", mileage: 112500, fuel: "Diesel", lastService: "2025-12-01" },
  { id: "V003", plate: "KCD 789C", make: "Toyota", model: "HiAce", year: 2023, type: "Van", capacity: 14, status: "maintenance", driver: "Peter Kamau", mileage: 22100, fuel: "Petrol", lastService: "2026-01-05" },
  { id: "V004", plate: "KDE 012D", make: "Mercedes", model: "Sprinter", year: 2020, type: "Van", capacity: 20, status: "active", driver: "Alice Wambui", mileage: 89300, fuel: "Diesel", lastService: "2025-10-20" },
  { id: "V005", plate: "KEF 345E", make: "MAN", model: "Lion Coach", year: 2022, type: "Bus", capacity: 52, status: "idle", driver: "—", mileage: 34600, fuel: "Diesel", lastService: "2025-12-15" },
  { id: "V006", plate: "KFG 678F", make: "Nissan", model: "Caravan", year: 2021, type: "Van", capacity: 12, status: "active", driver: "David Otieno", mileage: 67800, fuel: "Diesel", lastService: "2025-11-30" },
  { id: "V007", plate: "KGH 901G", make: "Scania", model: "Touring HD", year: 2023, type: "Bus", capacity: 48, status: "active", driver: "Sarah Njoki", mileage: 18900, fuel: "Diesel", lastService: "2025-12-20" },
  { id: "V008", plate: "KHI 234H", make: "Ford", model: "Transit", year: 2019, type: "Van", capacity: 15, status: "retired", driver: "—", mileage: 198400, fuel: "Diesel", lastService: "2025-09-10" },
];

const DRIVERS_DATA = [
  { id: "D001", name: "James Mwangi", license: "DL-2019-0412", licenseClass: "C1E", phone: "+254 712 345 678", email: "j.mwangi@transitops.co", status: "active", joined: "2019-03-15", trips: 842, rating: 4.8, vehicle: "KAA 123A", experience: 7 },
  { id: "D002", name: "Grace Odhiambo", license: "DL-2020-0891", licenseClass: "C", phone: "+254 723 456 789", email: "g.odhiambo@transitops.co", status: "active", joined: "2020-07-22", trips: 634, rating: 4.9, vehicle: "KBC 456B", experience: 5 },
  { id: "D003", name: "Peter Kamau", license: "DL-2018-0234", licenseClass: "D", phone: "+254 734 567 890", email: "p.kamau@transitops.co", status: "on_leave", joined: "2018-01-10", trips: 1120, rating: 4.7, vehicle: "KCD 789C", experience: 9 },
  { id: "D004", name: "Alice Wambui", license: "DL-2021-0567", licenseClass: "C", phone: "+254 745 678 901", email: "a.wambui@transitops.co", status: "active", joined: "2021-05-18", trips: 412, rating: 4.9, vehicle: "KDE 012D", experience: 4 },
  { id: "D005", name: "David Otieno", license: "DL-2017-0123", licenseClass: "C1E", phone: "+254 756 789 012", email: "d.otieno@transitops.co", status: "active", joined: "2017-11-05", trips: 1589, rating: 4.6, vehicle: "KFG 678F", experience: 11 },
  { id: "D006", name: "Sarah Njoki", license: "DL-2022-0789", licenseClass: "D", phone: "+254 767 890 123", email: "s.njoki@transitops.co", status: "active", joined: "2022-02-28", trips: 289, rating: 4.8, vehicle: "KGH 901G", experience: 3 },
  { id: "D007", name: "Michael Kamara", license: "DL-2019-0345", licenseClass: "C", phone: "+254 778 901 234", email: "m.kamara@transitops.co", status: "inactive", joined: "2019-09-14", trips: 703, rating: 4.5, vehicle: "—", experience: 7 },
];

const TRIPS_DATA = [
  { id: "T001", route: "Nairobi → Mombasa", driver: "James Mwangi", vehicle: "KAA 123A", departure: "2026-01-12 06:00", arrival: "2026-01-12 14:30", distance: 485, status: "completed", passengers: 28, revenue: 42000 },
  { id: "T002", route: "Nairobi → Nakuru", driver: "Grace Odhiambo", vehicle: "KBC 456B", departure: "2026-01-12 08:00", arrival: "2026-01-12 10:45", distance: 160, status: "completed", passengers: 0, revenue: 12500 },
  { id: "T003", route: "Mombasa → Malindi", driver: "Alice Wambui", vehicle: "KDE 012D", departure: "2026-01-12 09:30", arrival: "2026-01-12 11:00", distance: 120, status: "in_progress", passengers: 18, revenue: 14400 },
  { id: "T004", route: "Nairobi → Kisumu", driver: "David Otieno", vehicle: "KFG 678F", departure: "2026-01-12 07:00", arrival: "2026-01-12 13:00", distance: 340, status: "in_progress", passengers: 11, revenue: 18700 },
  { id: "T005", route: "Nakuru → Eldoret", driver: "Sarah Njoki", vehicle: "KGH 901G", departure: "2026-01-13 06:30", arrival: "2026-01-13 09:00", distance: 140, status: "scheduled", passengers: 42, revenue: 33600 },
  { id: "T006", route: "Kisumu → Nairobi", driver: "James Mwangi", vehicle: "KAA 123A", departure: "2026-01-13 14:00", arrival: "2026-01-13 20:00", distance: 340, status: "scheduled", passengers: 26, revenue: 31200 },
  { id: "T007", route: "Nairobi → Naivasha", driver: "Alice Wambui", vehicle: "KDE 012D", departure: "2026-01-11 10:00", arrival: "2026-01-11 12:00", distance: 90, status: "completed", passengers: 19, revenue: 9500 },
  { id: "T008", route: "Mombasa → Nairobi", driver: "Grace Odhiambo", vehicle: "KBC 456B", departure: "2026-01-11 06:00", arrival: "2026-01-11 14:30", distance: 485, status: "cancelled", passengers: 0, revenue: 0 },
];

const MAINTENANCE_DATA = [
  { id: "M001", vehicle: "KAA 123A", type: "Oil Change", scheduled: "2026-02-15", status: "upcoming", cost: 8500, technician: "Auto Care Garage", priority: "normal" },
  { id: "M002", vehicle: "KCD 789C", type: "Brake Overhaul", scheduled: "2026-01-20", status: "in_progress", cost: 32000, technician: "FleetFix Workshop", priority: "high" },
  { id: "M003", vehicle: "KDE 012D", type: "Tyre Replacement", scheduled: "2026-01-25", status: "upcoming", cost: 48000, technician: "Bridgestone Centre", priority: "high" },
  { id: "M004", vehicle: "KBC 456B", type: "Full Service", scheduled: "2026-03-01", status: "upcoming", cost: 15000, technician: "Auto Care Garage", priority: "normal" },
  { id: "M005", vehicle: "KFG 678F", type: "AC Service", scheduled: "2025-12-20", status: "completed", cost: 12000, technician: "CoolAir Auto", priority: "low" },
  { id: "M006", vehicle: "KGH 901G", type: "Transmission Service", scheduled: "2026-02-28", status: "upcoming", cost: 22000, technician: "FleetFix Workshop", priority: "normal" },
  { id: "M007", vehicle: "KEF 345E", type: "Engine Overhaul", scheduled: "2026-01-10", status: "overdue", cost: 85000, technician: "Heavy Duty Motors", priority: "critical" },
];

const FUEL_DATA = [
  { id: "F001", date: "2026-01-12", vehicle: "KAA 123A", driver: "James Mwangi", liters: 68, costPerLiter: 185, total: 12580, station: "Total Energies, Mombasa Rd" },
  { id: "F002", date: "2026-01-12", vehicle: "KBC 456B", driver: "Grace Odhiambo", liters: 22, costPerLiter: 183, total: 4026, station: "Shell, Waiyaki Way" },
  { id: "F003", date: "2026-01-11", vehicle: "KDE 012D", driver: "Alice Wambui", liters: 35, costPerLiter: 186, total: 6510, station: "Total Energies, Langata" },
  { id: "F004", date: "2026-01-10", vehicle: "KFG 678F", driver: "David Otieno", liters: 48, costPerLiter: 184, total: 8832, station: "Oilibya, Thika Rd" },
  { id: "F005", date: "2026-01-09", vehicle: "KGH 901G", driver: "Sarah Njoki", liters: 52, costPerLiter: 182, total: 9464, station: "Total Energies, Uhuru Hwy" },
  { id: "F006", date: "2026-01-08", vehicle: "KAA 123A", driver: "James Mwangi", liters: 71, costPerLiter: 185, total: 13135, station: "Shell, Mombasa Rd" },
];

const MONTHLY_CHART = [
  { month: "Aug", trips: 312, revenue: 4820, fuel: 1240 },
  { month: "Sep", trips: 287, revenue: 4430, fuel: 1150 },
  { month: "Oct", trips: 341, revenue: 5260, fuel: 1360 },
  { month: "Nov", trips: 298, revenue: 4590, fuel: 1190 },
  { month: "Dec", trips: 376, revenue: 5800, fuel: 1500 },
  { month: "Jan", trips: 94, revenue: 1450, fuel: 380 },
];

const VEHICLE_PIE = [
  { name: "Active", value: 4, color: "#22C55E" },
  { name: "Idle", value: 1, color: "#F59E0B" },
  { name: "Maintenance", value: 1, color: "#3B82F6" },
  { name: "Retired", value: 1, color: "#94A3B8" },
];

const WEEKLY_DIST = [
  { day: "Mon", km: 1240 },
  { day: "Tue", km: 980 },
  { day: "Wed", km: 1540 },
  { day: "Thu", km: 890 },
  { day: "Fri", km: 1720 },
  { day: "Sat", km: 2100 },
  { day: "Sun", km: 640 },
];

const DRIVER_PERF = [
  { name: "J. Mwangi", trips: 142, onTime: 96 },
  { name: "G. Odhiambo", trips: 128, onTime: 98 },
  { name: "A. Wambui", trips: 89, onTime: 97 },
  { name: "D. Otieno", trips: 165, onTime: 91 },
  { name: "S. Njoki", trips: 67, onTime: 94 },
];

const NOTIFICATIONS = [
  { id: 1, type: "warning", message: "KEF 345E engine overhaul is overdue", time: "2m ago", read: false },
  { id: 2, type: "info", message: "Trip T003 Mombasa→Malindi is in progress", time: "18m ago", read: false },
  { id: 3, type: "success", message: "Trip T001 Nairobi→Mombasa completed", time: "1h ago", read: false },
  { id: 4, type: "warning", message: "KDE 012D tyre replacement due in 13 days", time: "3h ago", read: true },
  { id: 5, type: "info", message: "Driver Peter Kamau on leave — reassign vehicle", time: "5h ago", read: true },
];

// ─────────────────────── UTILITIES ───────────────────────
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function fmtKES(n: number) {
  return "KES " + n.toLocaleString("en-KE");
}

// ─────────────────────── SHARED COMPONENTS ───────────────────────
type BadgeVariant = "active" | "idle" | "maintenance" | "retired" | "completed" | "in_progress" | "scheduled" | "cancelled" | "upcoming" | "overdue" | "on_leave" | "inactive" | "normal" | "high" | "critical" | "low";

const BADGE_STYLES: Record<BadgeVariant, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  idle: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  maintenance: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  retired: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  scheduled: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  cancelled: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  upcoming: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  on_leave: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  inactive: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
  normal: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const BADGE_LABELS: Record<BadgeVariant, string> = {
  active: "Active", idle: "Idle", maintenance: "Maintenance", retired: "Retired",
  completed: "Completed", in_progress: "In Progress", scheduled: "Scheduled", cancelled: "Cancelled",
  upcoming: "Upcoming", overdue: "Overdue", on_leave: "On Leave", inactive: "Inactive",
  normal: "Normal", high: "High", critical: "Critical", low: "Low",
};

function Badge({ status }: { status: BadgeVariant }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono tracking-wide", BADGE_STYLES[status])}>
      {BADGE_LABELS[status]}
    </span>
  );
}

function StatCard({ label, value, sub, trend, icon: Icon, color }: {
  label: string; value: string; sub?: string; trend?: number;
  icon: React.ElementType; color: string;
}) {
  const isPositive = (trend ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{label}</span>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", color)}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold font-['Outfit'] text-card-foreground">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5 font-mono">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={cn("flex items-center gap-1 text-xs font-mono", isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}% vs last month
        </div>
      )}
    </motion.div>
  );
}

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold font-['Outfit'] text-card-foreground">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-colors"
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-colors"
    >
      {children}
    </select>
  );
}

function Btn({ variant = "primary", size = "md", children, className, ...props }: {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = "inline-flex items-center gap-2 rounded-lg font-medium transition-all focus:outline-none";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90 active:scale-95",
    secondary: "bg-secondary text-secondary-foreground hover:bg-muted border border-border",
    ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
  };
  return (
    <button {...props} className={cn(base, sizes[size], variants[variant], className)}>
      {children}
    </button>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon size={28} className="text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground font-['Outfit']">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>
    </div>
  );
}

function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <h1 className="text-xl font-bold font-['Outfit'] text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
    </div>
  );
}

const TOOLTIP_STYLE = {
  contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", fontFamily: "DM Mono, monospace" },
  labelStyle: { color: "var(--card-foreground)", fontWeight: 600 },
};

// ─────────────────────── AUTH SCREEN ───────────────────────
function AuthScreen({ onLogin }: { onLogin: (role: Role) => void }) {
  const [email, setEmail] = useState("admin@transitops.co");
  const [password, setPassword] = useState("••••••••");
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<Role>("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError("Email is required"); return; }
    if (!password) { setError("Password is required"); return; }
    setLoading(true);
    setError("");
    setTimeout(() => { setLoading(false); onLogin(role); }, 1200);
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="flex-1 hidden lg:flex flex-col bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#1E3A5F_0%,#0F172A_50%,#162032_100%)]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-800/20 blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Truck size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg font-['Outfit'] tracking-tight">TransitOps</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="max-w-sm">
              <div className="text-xs font-mono text-blue-400/70 uppercase tracking-[0.2em] mb-4">Fleet Management Platform</div>
              <h2 className="text-3xl font-bold text-white font-['Outfit'] leading-tight mb-6">
                One platform.<br />Every vehicle,<br />every driver.
              </h2>
              <div className="space-y-3">
                {[
                  { icon: Truck, text: "Real-time fleet visibility" },
                  { icon: Navigation, text: "Live trip tracking & scheduling" },
                  { icon: BarChart3, text: "Advanced analytics & reporting" },
                  { icon: Shield, text: "Role-based access control" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-blue-300" />
                    </div>
                    <span className="text-sm text-slate-300">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-mono">© 2026 TransitOps Ltd. — v2.4.1</div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Truck size={15} className="text-white" />
            </div>
            <span className="font-bold font-['Outfit'] text-foreground">TransitOps</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold font-['Outfit'] text-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">Access your fleet management console</p>
          </div>

          {/* Role selector */}
          <div className="flex rounded-xl border border-border bg-card p-1 mb-6 gap-1">
            {(["admin", "manager", "driver"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all",
                  role === r
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email address">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@transitops.co"
              />
            </FormField>
            <FormField label="Password">
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </FormField>

            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                <AlertCircle size={13} />
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer select-none">
                <input type="checkbox" className="rounded border-border" />
                Remember me
              </label>
              <a href="#" className="text-primary hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={14} className="animate-spin" /> Signing in…
                </span>
              ) : "Sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Demo credentials pre-filled. Select role and click Sign in.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────── SIDEBAR ───────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "divider1", label: "Fleet", isDivider: true },
  { id: "vehicles", label: "Vehicles", icon: Truck },
  { id: "drivers", label: "Drivers", icon: Users },
  { id: "divider2", label: "Operations", isDivider: true },
  { id: "trips", label: "Trips", icon: Navigation },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "fuel", label: "Fuel & Expenses", icon: Fuel },
  { id: "divider3", label: "Insights", isDivider: true },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "divider4", label: "System", isDivider: true },
  { id: "settings", label: "Settings", icon: Settings },
];

function Sidebar({ active, onNav, collapsed, role }: {
  active: View; onNav: (v: View) => void; collapsed: boolean; role: Role;
}) {
  return (
    <aside
      className={cn(
        "h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 flex-shrink-0",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-sidebar-border h-14">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Truck size={15} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sm font-['Outfit'] text-sidebar-foreground tracking-tight whitespace-nowrap">
            TransitOps
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          if ("isDivider" in item && item.isDivider) {
            if (collapsed) return null;
            return (
              <div key={item.id} className="px-3 pt-4 pb-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                  {item.label}
                </span>
              </div>
            );
          }
          const Icon = item.icon!;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id as View)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                collapsed ? "justify-center" : "justify-start",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon size={15} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User size={13} className="text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-sidebar-foreground truncate">
                {role === "admin" ? "Alex Kariuki" : role === "manager" ? "Beatrice Auma" : "James Mwangi"}
              </div>
              <div className="text-[10px] text-muted-foreground capitalize font-mono">{role}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// ─────────────────────── TOPBAR ───────────────────────
function TopBar({ onToggleSidebar, onToggleTheme, isDark, view, role, onLogout }: {
  onToggleSidebar: () => void; onToggleTheme: () => void; isDark: boolean;
  view: View; role: Role; onLogout: () => void;
}) {
  const [search, setSearch] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const unread = notifs.filter((n) => !n.read).length;

  const viewLabels: Record<View, string> = {
    dashboard: "Dashboard", vehicles: "Vehicle Fleet", drivers: "Driver Registry",
    trips: "Trip Operations", maintenance: "Maintenance", fuel: "Fuel & Expenses",
    analytics: "Analytics", settings: "Settings",
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
      >
        <Menu size={16} />
      </button>

      <div className="text-sm font-semibold font-['Outfit'] text-foreground hidden sm:block">
        {viewLabels[view]}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 w-56">
        <Search size={13} className="text-muted-foreground flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
        />
      </div>

      {/* Theme */}
      <button
        onClick={onToggleTheme}
        className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
      >
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors relative"
        >
          <Bell size={15} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold font-['Outfit']">Notifications</span>
                <button
                  onClick={() => setNotifs(notifs.map((n) => ({ ...n, read: true })))}
                  className="text-[10px] text-primary hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {notifs.map((n) => (
                  <div
                    key={n.id}
                    className={cn("px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors", !n.read && "bg-primary/5")}
                    onClick={() => setNotifs(notifs.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                        n.type === "warning" ? "bg-amber-500" : n.type === "success" ? "bg-emerald-500" : "bg-blue-500"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono">{n.time}</p>
                      </div>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
        title="Sign out"
      >
        <LogOut size={15} />
      </button>
    </header>
  );
}

// ─────────────────────── DASHBOARD ───────────────────────
function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Vehicles" value="4 / 8" sub="2 idle · 1 maintenance" trend={12} icon={Truck} color="bg-blue-600" />
        <StatCard label="Active Drivers" value="5 / 7" sub="1 on leave · 1 inactive" trend={8} icon={Users} color="bg-violet-600" />
        <StatCard label="Trips This Month" value="94" sub="2 in progress" trend={-18} icon={Navigation} color="bg-emerald-600" />
        <StatCard label="Revenue (Jan)" value="KES 1.45M" sub="Target: KES 5.8M" trend={-21} icon={DollarSign} color="bg-amber-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground">Revenue & Fuel Cost</h3>
              <p className="text-xs text-muted-foreground font-mono">Aug 2025 — Jan 2026 (KES thousands)</p>
            </div>
            <Btn variant="ghost" size="sm"><Download size={12} /> Export</Btn>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_CHART}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
              <Area type="monotone" dataKey="fuel" stroke="#F59E0B" strokeWidth={2} fill="url(#fuelGrad)" name="Fuel Cost" />
              <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "DM Mono" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground mb-4">Fleet Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={VEHICLE_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {VEHICLE_PIE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {VEHICLE_PIE.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-mono font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly distance bar */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground mb-4">Weekly Distance (km)</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={WEEKLY_DIST} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="km" fill="#2563EB" radius={[4, 4, 0, 0]} name="Distance (km)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent trips */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground">Recent Trips</h3>
            <span className="text-xs text-primary cursor-pointer hover:underline">View all</span>
          </div>
          <div className="space-y-2">
            {TRIPS_DATA.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{t.route}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{t.driver} · {t.vehicle}</p>
                </div>
                <Badge status={t.status as BadgeVariant} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance alerts */}
      {MAINTENANCE_DATA.filter((m) => m.status === "overdue" || m.priority === "critical").length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-500" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-400">Maintenance Alerts</span>
          </div>
          <div className="space-y-2">
            {MAINTENANCE_DATA.filter((m) => m.status === "overdue" || m.priority === "critical").map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs">
                <span className="text-red-700 dark:text-red-300">{m.vehicle} — {m.type}</span>
                <span className="font-mono text-red-500">Scheduled: {m.scheduled}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────── VEHICLES ───────────────────────
function VehiclesView({ role }: { role: Role }) {
  const [vehicles, setVehicles] = useState(VEHICLES_DATA);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<typeof VEHICLES_DATA[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ plate: "", make: "", model: "", year: "2024", type: "Van", capacity: "15", status: "active", fuel: "Diesel" });

  const filtered = useMemo(() => vehicles.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.plate.toLowerCase().includes(q) || v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.driver.toLowerCase().includes(q);
    const matchType = filterType === "all" || v.type === filterType;
    const matchStatus = filterStatus === "all" || v.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  }), [vehicles, search, filterType, filterStatus]);

  function openAdd() { setEditItem(null); setForm({ plate: "", make: "", model: "", year: "2024", type: "Van", capacity: "15", status: "active", fuel: "Diesel" }); setModalOpen(true); }
  function openEdit(v: typeof VEHICLES_DATA[0]) { setEditItem(v); setForm({ plate: v.plate, make: v.make, model: v.model, year: String(v.year), type: v.type, capacity: String(v.capacity), status: v.status, fuel: v.fuel }); setModalOpen(true); }

  function handleSave() {
    if (!form.plate || !form.make || !form.model) return;
    if (editItem) {
      setVehicles(vehicles.map((v) => v.id === editItem.id ? { ...v, ...form, year: Number(form.year), capacity: Number(form.capacity) } : v));
    } else {
      const newV = { ...form, id: `V${String(vehicles.length + 1).padStart(3, "0")}`, year: Number(form.year), capacity: Number(form.capacity), driver: "—", mileage: 0, lastService: "—" };
      setVehicles([newV, ...vehicles]);
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) { setVehicles(vehicles.filter((v) => v.id !== id)); setDeleteId(null); }

  const canEdit = role === "admin" || role === "manager";

  return (
    <div>
      <SectionHeader
        title="Vehicle Fleet"
        description={`${vehicles.length} registered vehicles`}
        action={canEdit && <Btn variant="primary" size="sm" onClick={openAdd}><Plus size={13} /> Add Vehicle</Btn>}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vehicles…" className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
          <option value="all">All Types</option>
          {["Bus", "Truck", "Van"].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
          <option value="all">All Status</option>
          {["active", "idle", "maintenance", "retired"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Btn variant="ghost" size="sm"><Download size={12} /> Export</Btn>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["ID", "Plate", "Vehicle", "Type", "Status", "Driver", "Mileage", "Last Service", ""].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center text-sm text-muted-foreground">No vehicles match your filters</td></tr>
              ) : filtered.map((v) => (
                <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.id}</td>
                  <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{v.plate}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground text-xs">{v.make} {v.model}</div>
                    <div className="text-[10px] text-muted-foreground">{v.year} · {v.fuel}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{v.type}</td>
                  <td className="px-4 py-3"><Badge status={v.status as BadgeVariant} /></td>
                  <td className="px-4 py-3 text-xs text-foreground">{v.driver}</td>
                  <td className="px-4 py-3 text-xs font-mono text-foreground">{v.mileage.toLocaleString()} km</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{v.lastService}</td>
                  <td className="px-4 py-3">
                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(v)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={12} /></button>
                        <button onClick={() => setDeleteId(v.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-border text-xs text-muted-foreground font-mono">
          Showing {filtered.length} of {vehicles.length} vehicles
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Vehicle" : "Add Vehicle"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="License Plate *"><Input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} placeholder="KAA 123A" /></FormField>
            <FormField label="Year"><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></FormField>
            <FormField label="Make *"><Input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="Toyota" /></FormField>
            <FormField label="Model *"><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="HiAce" /></FormField>
            <FormField label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {["Bus", "Truck", "Van", "Car"].map((t) => <option key={t}>{t}</option>)}
              </Select>
            </FormField>
            <FormField label="Capacity (seats)"><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></FormField>
            <FormField label="Fuel Type">
              <Select value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })}>
                {["Diesel", "Petrol", "Electric", "Hybrid"].map((f) => <option key={f}>{f}</option>)}
              </Select>
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {["active", "idle", "maintenance", "retired"].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="flex gap-3 pt-2">
            <Btn variant="primary" className="flex-1" onClick={handleSave}><Check size={13} /> {editItem ? "Save Changes" : "Add Vehicle"}</Btn>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Vehicle">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">This action cannot be undone. The vehicle record and associated data will be permanently deleted.</p>
          </div>
          <div className="flex gap-3">
            <Btn variant="danger" className="flex-1" onClick={() => handleDelete(deleteId!)}><Trash2 size={13} /> Confirm Delete</Btn>
            <Btn variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────── DRIVERS ───────────────────────
function DriversView({ role }: { role: Role }) {
  const [drivers, setDrivers] = useState(DRIVERS_DATA);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<typeof DRIVERS_DATA[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", license: "", licenseClass: "C", status: "active" });

  const filtered = useMemo(() => drivers.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || d.license.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchStatus;
  }), [drivers, search, filterStatus]);

  function openAdd() { setEditItem(null); setForm({ name: "", email: "", phone: "", license: "", licenseClass: "C", status: "active" }); setModalOpen(true); }
  function openEdit(d: typeof DRIVERS_DATA[0]) { setEditItem(d); setForm({ name: d.name, email: d.email, phone: d.phone, license: d.license, licenseClass: d.licenseClass, status: d.status }); setModalOpen(true); }

  function handleSave() {
    if (!form.name || !form.email) return;
    if (editItem) {
      setDrivers(drivers.map((d) => d.id === editItem.id ? { ...d, ...form } : d));
    } else {
      setDrivers([{ ...form, id: `D${String(drivers.length + 1).padStart(3, "0")}`, joined: new Date().toISOString().slice(0, 10), trips: 0, rating: 5.0, vehicle: "—", experience: 0 }, ...drivers]);
    }
    setModalOpen(false);
  }

  const canEdit = role === "admin" || role === "manager";

  return (
    <div>
      <SectionHeader
        title="Driver Registry"
        description={`${drivers.length} registered drivers`}
        action={canEdit && <Btn variant="primary" size="sm" onClick={openAdd}><Plus size={13} /> Add Driver</Btn>}
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 min-w-40">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search drivers…" className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-full" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
          <option value="all">All Status</option>
          {["active", "on_leave", "inactive"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <Btn variant="ghost" size="sm"><Download size={12} /> Export</Btn>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Driver", "License", "Class", "Contact", "Status", "Vehicle", "Trips", "Rating", ""].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((d) => (
                <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <User size={12} className="text-primary" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-foreground">{d.name}</div>
                        <div className="text-[10px] text-muted-foreground">{d.experience}y exp</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{d.license}</td>
                  <td className="px-4 py-3 text-xs font-mono font-medium text-foreground">{d.licenseClass}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-foreground">{d.phone}</div>
                    <div className="text-[10px] text-muted-foreground">{d.email}</div>
                  </td>
                  <td className="px-4 py-3"><Badge status={d.status as BadgeVariant} /></td>
                  <td className="px-4 py-3 text-xs font-mono text-foreground">{d.vehicle}</td>
                  <td className="px-4 py-3 text-xs font-mono text-foreground">{d.trips.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span className="font-mono text-foreground">{d.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(d)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={12} /></button>
                        <button onClick={() => setDeleteId(d.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-border text-xs text-muted-foreground font-mono">
          Showing {filtered.length} of {drivers.length} drivers
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Driver" : "Add Driver"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="James Mwangi" /></FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {["active", "on_leave", "inactive"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </Select>
            </FormField>
            <FormField label="Email *"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="driver@transitops.co" /></FormField>
            <FormField label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254 7XX XXX XXX" /></FormField>
            <FormField label="License No."><Input value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} placeholder="DL-2024-0001" /></FormField>
            <FormField label="License Class">
              <Select value={form.licenseClass} onChange={(e) => setForm({ ...form, licenseClass: e.target.value })}>
                {["A", "B", "C", "C1", "C1E", "D", "D1"].map((c) => <option key={c}>{c}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="flex gap-3 pt-2">
            <Btn variant="primary" className="flex-1" onClick={handleSave}><Check size={13} /> {editItem ? "Save Changes" : "Add Driver"}</Btn>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Remove Driver">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">This will permanently remove the driver record. Assign their vehicle to another driver first.</p>
          </div>
          <div className="flex gap-3">
            <Btn variant="danger" className="flex-1" onClick={() => { setDrivers(drivers.filter((d) => d.id !== deleteId)); setDeleteId(null); }}>
              <Trash2 size={13} /> Confirm Remove
            </Btn>
            <Btn variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────── TRIPS ───────────────────────
function TripsView({ role }: { role: Role }) {
  const [trips, setTrips] = useState(TRIPS_DATA);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ route: "", driver: "", vehicle: "", departure: "", status: "scheduled", passengers: "0" });

  const filtered = useMemo(() => trips.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.route.toLowerCase().includes(q) || t.driver.toLowerCase().includes(q) || t.vehicle.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  }), [trips, search, filterStatus]);

  const statusCounts = useMemo(() => ({
    all: trips.length,
    completed: trips.filter((t) => t.status === "completed").length,
    in_progress: trips.filter((t) => t.status === "in_progress").length,
    scheduled: trips.filter((t) => t.status === "scheduled").length,
    cancelled: trips.filter((t) => t.status === "cancelled").length,
  }), [trips]);

  function handleAddTrip() {
    if (!form.route || !form.driver || !form.vehicle) return;
    setTrips([{
      id: `T${String(trips.length + 1).padStart(3, "0")}`,
      route: form.route, driver: form.driver, vehicle: form.vehicle,
      departure: form.departure, arrival: "—", distance: 0,
      status: form.status, passengers: Number(form.passengers), revenue: 0,
    }, ...trips]);
    setModalOpen(false);
  }

  const canEdit = role === "admin" || role === "manager";

  return (
    <div>
      <SectionHeader
        title="Trip Operations"
        description="Manage all scheduled and active trips"
        action={canEdit && <Btn variant="primary" size="sm" onClick={() => setModalOpen(true)}><Plus size={13} /> Schedule Trip</Btn>}
      />

      {/* Status tabs */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              filterStatus === status
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {status === "all" ? "All" : status.replace("_", " ")} <span className="ml-1 font-mono">{count}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
            <Search size={13} className="text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search trips…" className="bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none text-foreground w-36" />
          </div>
          <Btn variant="ghost" size="sm"><Download size={12} /> Export</Btn>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Trip ID", "Route", "Driver", "Vehicle", "Departure", "Distance", "Passengers", "Revenue", "Status"].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center text-sm text-muted-foreground">No trips match the current filter</td></tr>
              ) : filtered.map((t) => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                  <td className="px-4 py-3 font-medium text-xs text-foreground">{t.route}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{t.driver}</td>
                  <td className="px-4 py-3 text-xs font-mono text-foreground">{t.vehicle}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{t.departure}</td>
                  <td className="px-4 py-3 text-xs font-mono text-foreground">{t.distance > 0 ? `${t.distance} km` : "—"}</td>
                  <td className="px-4 py-3 text-xs font-mono text-foreground">{t.passengers > 0 ? t.passengers : "—"}</td>
                  <td className="px-4 py-3 text-xs font-mono text-foreground">{t.revenue > 0 ? `KES ${t.revenue.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3"><Badge status={t.status as BadgeVariant} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-border text-xs text-muted-foreground font-mono">
          Showing {filtered.length} of {trips.length} trips
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule New Trip">
        <div className="space-y-4">
          <FormField label="Route *"><Input value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} placeholder="Nairobi → Mombasa" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Driver *">
              <Select value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })}>
                <option value="">Select driver…</option>
                {DRIVERS_DATA.filter((d) => d.status === "active").map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Vehicle *">
              <Select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
                <option value="">Select vehicle…</option>
                {VEHICLES_DATA.filter((v) => v.status === "active").map((v) => <option key={v.id} value={v.plate}>{v.plate} ({v.make} {v.model})</option>)}
              </Select>
            </FormField>
            <FormField label="Departure"><Input type="datetime-local" value={form.departure} onChange={(e) => setForm({ ...form, departure: e.target.value })} /></FormField>
            <FormField label="Passengers"><Input type="number" value={form.passengers} onChange={(e) => setForm({ ...form, passengers: e.target.value })} /></FormField>
          </div>
          <div className="flex gap-3 pt-2">
            <Btn variant="primary" className="flex-1" onClick={handleAddTrip}><Check size={13} /> Schedule Trip</Btn>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────── MAINTENANCE ───────────────────────
function MaintenanceView({ role }: { role: Role }) {
  const [items, setItems] = useState(MAINTENANCE_DATA);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ vehicle: "", type: "", scheduled: "", cost: "", technician: "", priority: "normal" });

  const filtered = useMemo(() => items.filter((m) => {
    const matchStatus = filterStatus === "all" || m.status === filterStatus;
    const matchPriority = filterPriority === "all" || m.priority === filterPriority;
    return matchStatus && matchPriority;
  }), [items, filterStatus, filterPriority]);

  const canEdit = role === "admin" || role === "manager";

  const priorityIcon: Record<string, React.ElementType> = {
    critical: AlertTriangle, high: AlertCircle, normal: Clock, low: CheckCircle,
  };

  function handleAdd() {
    if (!form.vehicle || !form.type) return;
    setItems([{ id: `M${String(items.length + 1).padStart(3, "0")}`, ...form, cost: Number(form.cost), status: "upcoming" }, ...items]);
    setModalOpen(false);
  }

  return (
    <div>
      <SectionHeader
        title="Maintenance Schedule"
        description="Track vehicle servicing, repairs, and inspections"
        action={canEdit && <Btn variant="primary" size="sm" onClick={() => setModalOpen(true)}><Plus size={13} /> Add Record</Btn>}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Overdue", count: items.filter((m) => m.status === "overdue").length, color: "text-red-500 bg-red-50 dark:bg-red-900/10" },
          { label: "In Progress", count: items.filter((m) => m.status === "in_progress").length, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/10" },
          { label: "Upcoming", count: items.filter((m) => m.status === "upcoming").length, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/10" },
          { label: "Completed", count: items.filter((m) => m.status === "completed").length, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10" },
        ].map(({ label, count, color }) => (
          <div key={label} className={cn("rounded-xl p-4 border border-border flex items-center gap-3", color)}>
            <span className="text-2xl font-bold font-['Outfit']">{count}</span>
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
          <option value="all">All Status</option>
          {["overdue", "in_progress", "upcoming", "completed"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
          <option value="all">All Priority</option>
          {["critical", "high", "normal", "low"].map((p) => <option key={p}>{p}</option>)}
        </select>
        <Btn variant="ghost" size="sm"><Download size={12} /> Export</Btn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((m) => {
          const PIcon = priorityIcon[m.priority] || Clock;
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge status={m.status as BadgeVariant} />
                    <Badge status={m.priority as BadgeVariant} />
                  </div>
                  <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground">{m.type}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{m.vehicle}</p>
                </div>
                <div className="flex items-center gap-1">
                  {canEdit && (
                    <button onClick={() => setItems(items.filter((x) => x.id !== m.id))} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Scheduled</p>
                  <p className="font-mono font-medium text-foreground">{m.scheduled}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Est. Cost</p>
                  <p className="font-mono font-medium text-foreground">{fmtKES(m.cost)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Technician</p>
                  <p className="font-medium text-foreground">{m.technician}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && <EmptyState icon={Wrench} title="No records found" description="No maintenance records match the current filters." />}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Maintenance Record">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Vehicle *">
              <Select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
                <option value="">Select vehicle…</option>
                {VEHICLES_DATA.map((v) => <option key={v.id} value={v.plate}>{v.plate}</option>)}
              </Select>
            </FormField>
            <FormField label="Priority">
              <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {["critical", "high", "normal", "low"].map((p) => <option key={p}>{p}</option>)}
              </Select>
            </FormField>
            <FormField label="Service Type *"><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Oil Change, Tyre Replacement…" /></FormField>
            <FormField label="Scheduled Date"><Input type="date" value={form.scheduled} onChange={(e) => setForm({ ...form, scheduled: e.target.value })} /></FormField>
            <FormField label="Est. Cost (KES)"><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></FormField>
            <FormField label="Technician"><Input value={form.technician} onChange={(e) => setForm({ ...form, technician: e.target.value })} /></FormField>
          </div>
          <div className="flex gap-3 pt-2">
            <Btn variant="primary" className="flex-1" onClick={handleAdd}><Check size={13} /> Add Record</Btn>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────── FUEL & EXPENSES ───────────────────────
function FuelView({ role }: { role: Role }) {
  const [records, setRecords] = useState(FUEL_DATA);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ date: "", vehicle: "", driver: "", liters: "", costPerLiter: "185", station: "" });

  const totalLiters = records.reduce((a, r) => a + r.liters, 0);
  const totalCost = records.reduce((a, r) => a + r.total, 0);
  const avgCostPerL = totalCost / totalLiters;

  const canEdit = role === "admin" || role === "manager";

  function handleAdd() {
    if (!form.vehicle || !form.liters) return;
    const liters = Number(form.liters);
    const cpl = Number(form.costPerLiter);
    setRecords([{ id: `F${String(records.length + 1).padStart(3, "0")}`, ...form, liters, costPerLiter: cpl, total: liters * cpl }, ...records]);
    setModalOpen(false);
  }

  return (
    <div>
      <SectionHeader
        title="Fuel & Expenses"
        description="Track fuel consumption and operational costs"
        action={canEdit && <Btn variant="primary" size="sm" onClick={() => setModalOpen(true)}><Plus size={13} /> Log Fuel</Btn>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Total Fuel (Jan)</p>
          <p className="text-2xl font-bold font-['Outfit'] text-foreground">{totalLiters.toLocaleString()} L</p>
          <p className="text-xs text-muted-foreground font-mono mt-1">Across {records.length} fill-ups</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Total Fuel Cost</p>
          <p className="text-2xl font-bold font-['Outfit'] text-foreground">{fmtKES(totalCost)}</p>
          <p className="text-xs text-muted-foreground font-mono mt-1">+8.2% vs Dec 2025</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Avg. Cost / Litre</p>
          <p className="text-2xl font-bold font-['Outfit'] text-foreground">KES {avgCostPerL.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground font-mono mt-1">Market rate: KES 183–186</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground">Fuel Log</h3>
          <Btn variant="ghost" size="sm"><Download size={12} /> Export CSV</Btn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Date", "Vehicle", "Driver", "Litres", "Cost/L", "Total", "Station", ""].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.date}</td>
                  <td className="px-4 py-3 text-xs font-mono font-medium text-foreground">{r.vehicle}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{r.driver}</td>
                  <td className="px-4 py-3 text-xs font-mono text-foreground">{r.liters} L</td>
                  <td className="px-4 py-3 text-xs font-mono text-foreground">KES {r.costPerLiter}</td>
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-foreground">{fmtKES(r.total)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.station}</td>
                  <td className="px-4 py-3">
                    {canEdit && (
                      <button onClick={() => setRecords(records.filter((x) => x.id !== r.id))} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
          <span className="text-xs text-muted-foreground font-mono">{records.length} records</span>
          <span className="text-xs font-mono font-semibold text-foreground">Total: {fmtKES(totalCost)}</span>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Fuel Record">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date *"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></FormField>
            <FormField label="Vehicle *">
              <Select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
                <option value="">Select…</option>
                {VEHICLES_DATA.map((v) => <option key={v.id} value={v.plate}>{v.plate}</option>)}
              </Select>
            </FormField>
            <FormField label="Driver">
              <Select value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })}>
                <option value="">Select…</option>
                {DRIVERS_DATA.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Litres *"><Input type="number" value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} placeholder="45" /></FormField>
            <FormField label="Cost per Litre (KES)"><Input type="number" value={form.costPerLiter} onChange={(e) => setForm({ ...form, costPerLiter: e.target.value })} /></FormField>
            <FormField label="Fuel Station"><Input value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} placeholder="Shell, Waiyaki Way" /></FormField>
          </div>
          {form.liters && form.costPerLiter && (
            <div className="flex items-center justify-between px-4 py-3 bg-primary/10 rounded-xl text-sm">
              <span className="text-muted-foreground">Estimated Total</span>
              <span className="font-mono font-bold text-primary">{fmtKES(Number(form.liters) * Number(form.costPerLiter))}</span>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Btn variant="primary" className="flex-1" onClick={handleAdd}><Check size={13} /> Log Record</Btn>
            <Btn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────── ANALYTICS ───────────────────────
function AnalyticsView() {
  const [range, setRange] = useState("6m");

  return (
    <div>
      <SectionHeader
        title="Analytics & Insights"
        description="Fleet performance metrics and operational intelligence"
        action={
          <div className="flex items-center gap-2">
            {["1m", "3m", "6m", "1y"].map((r) => (
              <button key={r} onClick={() => setRange(r)} className={cn("px-3 py-1.5 text-xs rounded-lg transition-all", range === r ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>
                {r}
              </button>
            ))}
            <Btn variant="ghost" size="sm"><Download size={12} /> Report</Btn>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly trips & revenue */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground mb-4">Monthly Trips</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MONTHLY_CHART} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="trips" fill="#2563EB" radius={[4, 4, 0, 0]} name="Trips" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue vs fuel cost */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground mb-4">Revenue vs Fuel (KES '000)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={MONTHLY_CHART}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
              <Line type="monotone" dataKey="fuel" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name="Fuel Cost" />
              <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "DM Mono" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Driver performance */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground mb-4">Driver Performance — On-time %</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={DRIVER_PERF} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" domain={[80, 100]} tick={{ fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="onTime" fill="#22C55E" radius={[0, 4, 4, 0]} name="On-time %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet utilisation pie */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground mb-4">Fleet Utilisation</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={VEHICLE_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {VEHICLE_PIE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {VEHICLE_PIE.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-semibold text-foreground">{item.value}</span>
                    <span className="text-muted-foreground ml-1 font-mono">({Math.round(item.value / 7 * 100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI summary */}
      <div className="mt-6 bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground mb-4">Key Performance Indicators — Jan 2026</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Fleet Utilisation", value: "71%", trend: "+3%", positive: true },
            { label: "Avg Driver Rating", value: "4.75", trend: "+0.05", positive: true },
            { label: "On-time Delivery", value: "95.2%", trend: "-0.8%", positive: false },
            { label: "Cost per km", value: "KES 68", trend: "+4%", positive: false },
          ].map(({ label, value, trend, positive }) => (
            <div key={label} className="flex flex-col gap-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</p>
              <p className="text-xl font-bold font-['Outfit'] text-foreground">{value}</p>
              <p className={cn("text-xs font-mono flex items-center gap-1", positive ? "text-emerald-500" : "text-red-500")}>
                {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {trend} vs Dec
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────── SETTINGS ───────────────────────
function SettingsView({ role, isDark, onToggleTheme }: { role: Role; isDark: boolean; onToggleTheme: () => void }) {
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({ company: "FleetCore Transport Co.", email: "admin@transitops.co", phone: "+254 700 000 000", timezone: "Africa/Nairobi" });
  const [notifSettings, setNotifSettings] = useState({ maintenance: true, trips: true, fuel: false, reports: true });

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  const tabs = [
    { id: "profile", label: "Company Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Layers },
    { id: "security", label: "Security & Access", icon: Shield },
  ];

  return (
    <div>
      <SectionHeader title="Settings" description="Manage your organization and platform preferences" />

      <div className="flex gap-6">
        {/* Tabs sidebar */}
        <div className="w-44 flex-shrink-0 hidden sm:block">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all",
                  tab === id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 bg-card border border-border rounded-xl p-6">
          {tab === "profile" && (
            <div className="space-y-5 max-w-md">
              <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground border-b border-border pb-3">Company Profile</h3>
              <FormField label="Company Name"><Input value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} /></FormField>
              <FormField label="Admin Email"><Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></FormField>
              <FormField label="Phone"><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></FormField>
              <FormField label="Timezone">
                <Select value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}>
                  {["Africa/Nairobi", "Africa/Lagos", "Africa/Cairo", "Europe/London", "America/New_York"].map((tz) => <option key={tz}>{tz}</option>)}
                </Select>
              </FormField>
              <div className="flex items-center gap-3 pt-2">
                <Btn variant="primary" onClick={handleSave}>
                  {saved ? <><Check size={13} /> Saved!</> : "Save Changes"}
                </Btn>
                <Btn variant="secondary" onClick={() => setProfile({ company: "FleetCore Transport Co.", email: "admin@transitops.co", phone: "+254 700 000 000", timezone: "Africa/Nairobi" })}>
                  Reset
                </Btn>
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-5 max-w-md">
              <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground border-b border-border pb-3">Notification Preferences</h3>
              {[
                { key: "maintenance", label: "Maintenance alerts", desc: "Overdue services and upcoming reminders" },
                { key: "trips", label: "Trip updates", desc: "Trip starts, completions, and cancellations" },
                { key: "fuel", label: "Fuel cost alerts", desc: "Unusual fuel consumption patterns" },
                { key: "reports", label: "Weekly reports", desc: "Automated fleet performance summaries" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifSettings({ ...notifSettings, [key]: !notifSettings[key as keyof typeof notifSettings] })}
                    className={cn("relative w-10 h-6 rounded-full transition-colors", notifSettings[key as keyof typeof notifSettings] ? "bg-primary" : "bg-switch-background")}
                  >
                    <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform", notifSettings[key as keyof typeof notifSettings] ? "translate-x-5" : "translate-x-0.5")} />
                  </button>
                </div>
              ))}
              <Btn variant="primary" onClick={handleSave}>{saved ? <><Check size={13} /> Saved!</> : "Save Preferences"}</Btn>
            </div>
          )}

          {tab === "appearance" && (
            <div className="space-y-5 max-w-md">
              <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground border-b border-border pb-3">Appearance</h3>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Dark mode</p>
                  <p className="text-xs text-muted-foreground">Switch between light and dark interface</p>
                </div>
                <button
                  onClick={onToggleTheme}
                  className={cn("relative w-10 h-6 rounded-full transition-colors", isDark ? "bg-primary" : "bg-switch-background")}
                >
                  <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform", isDark ? "translate-x-5" : "translate-x-0.5")} />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground mb-3">Accent Color</p>
                <div className="flex gap-3">
                  {["#2563EB", "#16A34A", "#9333EA", "#DC2626", "#D97706"].map((color) => (
                    <button key={color} className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white transition-all" style={{ background: color }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-5 max-w-md">
              <h3 className="text-sm font-semibold font-['Outfit'] text-card-foreground border-b border-border pb-3">Security & Access Control</h3>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Role Permissions</p>
                {[
                  { role: "admin", perms: ["Full access", "User management", "Delete records", "System config"] },
                  { role: "manager", perms: ["View & edit fleet", "Schedule trips", "View reports", "No system config"] },
                  { role: "driver", perms: ["View assigned trips", "Log fuel", "View own profile", "Read-only fleet"] },
                ].map(({ role: r, perms }) => (
                  <div key={r} className={cn("p-4 rounded-xl border", role === r ? "border-primary bg-primary/5" : "border-border")}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={13} className={role === r ? "text-primary" : "text-muted-foreground"} />
                      <span className={cn("text-sm font-semibold capitalize font-['Outfit']", role === r ? "text-primary" : "text-card-foreground")}>{r}</span>
                      {role === r && <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded font-mono">Current</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {perms.map((p) => <span key={p} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-mono">{p}</span>)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Change Password</h4>
                <div className="space-y-3">
                  <FormField label="Current Password"><Input type="password" placeholder="••••••••" /></FormField>
                  <FormField label="New Password"><Input type="password" placeholder="Min. 8 characters" /></FormField>
                  <FormField label="Confirm New Password"><Input type="password" placeholder="Repeat password" /></FormField>
                  <Btn variant="primary">Update Password</Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────── APP ───────────────────────
export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<Role>("admin");
  const [isDark, setIsDark] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!authenticated) {
    return (
      <div className={isDark ? "dark" : ""}>
        <AuthScreen onLogin={(r) => { setRole(r); setAuthenticated(true); }} />
      </div>
    );
  }

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <Sidebar active={view} onNav={setView} collapsed={sidebarCollapsed} role={role} />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopBar
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            onToggleTheme={() => setIsDark(!isDark)}
            isDark={isDark}
            view={view}
            role={role}
            onLogout={() => setAuthenticated(false)}
          />

          <main className="flex-1 overflow-auto">
            <div className="p-5 lg:p-6 max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {view === "dashboard" && <Dashboard />}
                  {view === "vehicles" && <VehiclesView role={role} />}
                  {view === "drivers" && <DriversView role={role} />}
                  {view === "trips" && <TripsView role={role} />}
                  {view === "maintenance" && <MaintenanceView role={role} />}
                  {view === "fuel" && <FuelView role={role} />}
                  {view === "analytics" && <AnalyticsView />}
                  {view === "settings" && <SettingsView role={role} isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
