export const PERMISSIONS = {
  // Trade Permissions
  CAN_TRADE: 'trade:execute',
  CAN_WITHDRAW: 'wallet:withdraw',

  // User Management
  CAN_VIEW_USERS: 'users:read',
  CAN_EDIT_USERS: 'users:write',

  // System
  CAN_ACCESS_ADMIN_PANEL: 'admin:access',
  CAN_MANAGE_ROLES: 'roles:manage',
  CAN_MANAGE_BANNER: 'banner:manage',
  CAN_MANAGE_CHATS: 'chats:manage',
  CAN_MANAGE_KYC: 'kyc:manage',
  CAN_MANAGE_BANK_ACCOUNTS: 'bank-account:manage',

  // Transactions
  CAN_MANAGE_TRANSACTION: 'transaction:manage',
  CAN_BROADCAST_EMAIL: 'email:broadcast',

  // Positions
  CAN_MANAGE_POSITIONS: 'positions:manage',

  // Payment methods
  CAN_MANAGE_PAYMENT: 'payment:manage',
};
