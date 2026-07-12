CREATE TYPE "public"."driver_status" AS ENUM('Available', 'On Trip', 'Off Duty', 'Suspended');--> statement-breakpoint
CREATE TYPE "public"."expense_type" AS ENUM('Fuel', 'Maintenance', 'Toll');--> statement-breakpoint
CREATE TYPE "public"."maintenance_log_status" AS ENUM('Open', 'Closed');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('Draft', 'Dispatched', 'Completed', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('Available', 'On Trip', 'In Shop', 'Retired');--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"license_number" text NOT NULL,
	"license_category" text NOT NULL,
	"licenseExpiryDate" timestamp(3) with time zone NOT NULL,
	"contact_number" text NOT NULL,
	"safety_score" integer DEFAULT 100 NOT NULL,
	"status" "driver_status" NOT NULL,
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "drivers_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"type" "expense_type" NOT NULL,
	"cost" numeric NOT NULL,
	"liters" numeric,
	"date" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"description" text NOT NULL,
	"status" "maintenance_log_status" NOT NULL,
	"cost" numeric,
	"date_logged" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"destination" text NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"driver_id" uuid NOT NULL,
	"cargo_weight" numeric NOT NULL,
	"planned_distance" numeric NOT NULL,
	"status" "trip_status" NOT NULL,
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" "role" NOT NULL,
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_number" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"max_load_capacity" numeric NOT NULL,
	"odometer" numeric DEFAULT '0' NOT NULL,
	"acquisition_cost" numeric NOT NULL,
	"status" "vehicle_status" NOT NULL,
	"createdAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_registration_number_unique" UNIQUE("registration_number")
);
--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE restrict ON UPDATE no action;