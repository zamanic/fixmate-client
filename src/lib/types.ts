/**
 * FixMate shared vocabulary — the single place where the contract's enums,
 * display labels and badge colours live. Mirrors `.project/CONTRACT.md` §2–§4.
 *
 * Nothing in the app may invent a category, status or colour outside this file.
 */

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export const ROLES = ["customer", "technician", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const SERVICE_CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const SERVICE_MODES = ["Home Visit", "Shop Drop-off"] as const;
export type ServiceMode = (typeof SERVICE_MODES)[number];

export const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const BOOKING_STATUSES = [
  "requested",
  "accepted",
  "rejected",
  "in-progress",
  "completed",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = ["unpaid", "paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export interface AppUser {
  id: string;
  name: string;
  email: string;
  image: string;
  role: Role;
  phone: string;
  area: string;
  bio: string;
  createdAt: string | null;
}

export interface Service {
  _id: string;
  title: string;
  category: ServiceCategory;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: ApprovalStatus;
  isAvailable: boolean;
  createdAt: string;
}

export interface StatusHistoryEntry {
  status: BookingStatus;
  changedAt: string;
}

export interface Booking {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  category: ServiceCategory;
  basePrice: number;
  technicianName: string;
  technicianEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: BookingStatus;
  finalAmount: number;
  paymentStatus: PaymentStatus;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  rating?: number | null;
  review?: string | null;
}

export interface Payment {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: string;
  paidAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

/* ------------------------------------------------------------------ */
/* Display maps — labels + badge colours (one palette everywhere)       */
/* ------------------------------------------------------------------ */

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  "in-progress": "In Progress",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

/**
 * Badge classes per status. Colours resolve to the status tokens defined in
 * `globals.css` so light/dark mode stay in step.
 */
export const BOOKING_STATUS_CLASS: Record<BookingStatus, string> = {
  requested: "bg-status-requested/12 text-status-requested ring-status-requested/25",
  accepted: "bg-status-accepted/12 text-status-accepted ring-status-accepted/25",
  "in-progress": "bg-status-inprogress/14 text-status-inprogress ring-status-inprogress/25",
  completed: "bg-status-completed/12 text-status-completed ring-status-completed/25",
  rejected: "bg-status-rejected/12 text-status-rejected ring-status-rejected/25",
  cancelled: "bg-status-cancelled/12 text-status-cancelled ring-status-cancelled/25",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
};

export const PAYMENT_STATUS_CLASS: Record<PaymentStatus, string> = {
  unpaid: "bg-status-unpaid/12 text-status-unpaid ring-status-unpaid/25",
  paid: "bg-status-paid/12 text-status-paid ring-status-paid/25",
};

export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const APPROVAL_STATUS_CLASS: Record<ApprovalStatus, string> = {
  pending: "bg-status-inprogress/14 text-status-inprogress ring-status-inprogress/25",
  approved: "bg-status-completed/12 text-status-completed ring-status-completed/25",
  rejected: "bg-status-rejected/12 text-status-rejected ring-status-rejected/25",
};

export const ROLE_LABEL: Record<Role, string> = {
  customer: "Customer",
  technician: "Technician",
  admin: "Admin",
};

/** Category → tailwind tint token (used by category cards + service tiles). */
export const CATEGORY_TINT: Record<ServiceCategory, string> = {
  Smartphone: "bg-tint-smartphone",
  "Laptop & PC": "bg-tint-laptop",
  AC: "bg-tint-ac",
  Refrigerator: "bg-tint-refrigerator",
  TV: "bg-tint-tv",
  "Washing Machine": "bg-tint-washing",
  Electrical: "bg-tint-electrical",
};

/** The 5-step tracker shown in My Bookings. */
export const TRACKER_STEPS: BookingStatus[] = [
  "requested",
  "accepted",
  "in-progress",
  "completed",
];

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

export function formatMoney(value: number | null | undefined): string {
  const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Initials used by avatar fallbacks. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
