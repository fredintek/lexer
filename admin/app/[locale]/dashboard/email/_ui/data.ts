export const TEMPLATE_LABELS: Record<keyof typeof EMAIL_TEMPLATES, string> = {
  "Security Alert": "TEMPLATE_SECURITY_ALERT",
  "KYC Approved": "TEMPLATE_KYC_APPROVED",
  Maintenance: "TEMPLATE_MAINTENANCE",
  "New Asset Launch": "TEMPLATE_NEW_ASSET",
  "Withdrawal Success": "TEMPLATE_WITHDRAWAL_SUCCESS",
  "KYC Rejected": "TEMPLATE_KYC_REJECTED",
  "Inactivity Warning": "TEMPLATE_INACTIVITY",
  "System Upgrade": "TEMPLATE_SYSTEM_UPGRADE",
  "Compliance Update": "TEMPLATE_COMPLIANCE",
  "Referral Bonus": "TEMPLATE_REFERRAL",
  "Account Locked": "TEMPLATE_ACCOUNT_LOCKED",
  "Holiday Greeting": "TEMPLATE_HOLIDAY",
};

export const EMAIL_TEMPLATES = {
  "Security Alert": {
    subjectKey: "SECURITY_ALERT_SUB",
    messageKey: "SECURITY_ALERT_MSG",
  },
  "KYC Approved": {
    subjectKey: "KYC_APPROVED_SUB",
    messageKey: "KYC_APPROVED_MSG",
  },
  Maintenance: {
    subjectKey: "MAINTENANCE_SUB",
    messageKey: "MAINTENANCE_MSG",
  },
  "New Asset Launch": {
    subjectKey: "NEW_ASSET_SUB",
    messageKey: "NEW_ASSET_MSG",
  },
  "Withdrawal Success": {
    subjectKey: "WITHDRAWAL_SUCCESS_SUB",
    messageKey: "WITHDRAWAL_SUCCESS_MSG",
  },
  "KYC Rejected": {
    subjectKey: "KYC_REJECTED_SUB",
    messageKey: "KYC_REJECTED_MSG",
  },
  "Inactivity Warning": {
    subjectKey: "INACTIVITY_SUB",
    messageKey: "INACTIVITY_MSG",
  },
  "System Upgrade": {
    subjectKey: "SYSTEM_UPGRADE_SUB",
    messageKey: "SYSTEM_UPGRADE_MSG",
  },
  "Compliance Update": {
    subjectKey: "COMPLIANCE_UPDATE_SUB",
    messageKey: "COMPLIANCE_UPDATE_MSG",
  },
  "Referral Bonus": {
    subjectKey: "REFERRAL_BONUS_SUB",
    messageKey: "REFERRAL_BONUS_MSG",
  },
  "Account Locked": {
    subjectKey: "ACCOUNT_LOCKED_SUB",
    messageKey: "ACCOUNT_LOCKED_MSG",
  },
  "Holiday Greeting": {
    subjectKey: "HOLIDAY_GREETING_SUB",
    messageKey: "HOLIDAY_GREETING_MSG",
  },
};
