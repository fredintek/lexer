export enum MFAEnum {
  TOTP = "TOTP",
  SMS = "SMS",
  EMAIL = "EMAIL",
}

export type ActivityType =
  | "LOGIN"
  | "WITHDRAWAL"
  | "SECURITY"
  | "TRADE"
  | "PROFILE"
  | "TRANSACTION";
