export enum UserRole {
	FLEET_MANAGER = 'Fleet Manager',
	DRIVER = 'Driver',
	SAFETY_OFFICER = 'Safety Officer',
	FINANCIAL_ANALYST = 'Financial Analyst'
}

export enum VehicleStatus {
	AVAILABLE = 'Available',
	ON_TRIP = 'On Trip',
	IN_SHOP = 'In Shop',
	RETIRED = 'Retired'
}

export enum DriverStatus {
	AVAILABLE = 'Available',
	ON_TRIP = 'On Trip',
	OFF_DUTY = 'Off Duty',
	SUSPENDED = 'Suspended'
}

export enum TripStatus {
	DRAFT = 'Draft',
	DISPATCHED = 'Dispatched',
	COMPLETED = 'Completed',
	CANCELLED = 'Cancelled'
}

export enum ExpenseType {
	FUEL = 'Fuel',
	MAINTENANCE = 'Maintenance',
	TOLL = 'Toll'
}

export enum MaintenanceLogStatus {
	OPEN = 'Open',
	CLOSED = 'Closed'
}

export const USER_ROLES: { value: UserRole; label: string }[] = [
	{ value: UserRole.FLEET_MANAGER, label: 'Fleet Manager' },
	{ value: UserRole.DRIVER, label: 'Driver' },
	{ value: UserRole.SAFETY_OFFICER, label: 'Safety Officer' },
	{ value: UserRole.FINANCIAL_ANALYST, label: 'Financial Analyst' }
] as const;

export const SUPABASE_AUTH_TAG = 'supabase:auth';
