import { Customer, User } from "@prisma/client";

export type CustomerProfile = Customer & {
  user: Pick<User, "clerkUserId" | "email" | "name" | "role" | "status"> | null;
};

export type WalkInCustomer = Customer & {
  user: null | Pick<User, "clerkUserId" | "email" | "name" | "role" | "status">;
};