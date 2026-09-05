export type UserRole = "super_admin" | "admin" | "staff" | "customer";
export type UserStatus = "active" | "disabled";

export interface PublicMetadata {
  role: UserRole;
  status: UserStatus;
}

export interface SessionClaims {
  metadata: PublicMetadata;
}