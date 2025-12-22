// Type definitions for the Purchase module
// These aliases describe the allowed values for various status and priority fields.

export type PriorityLevel = 'high' | 'medium' | 'low';
export type StatusType = 'pending' | 'approved' | 'rejected';
export type UrgencyLevel = 'urgent' | 'medium' | 'normal';
export type NeedsStatusType = 'essential' | 'optional' | 'unnecessary';
export type WarehouseAvailability = 'available' | 'not_available';
export type WarehouseCondition = 'new' | 'used' | 'damaged';
export type PurchaseItemStatus = 'pending' | 'approved' | 'rejected';
export type OfferStatus = 'pending' | 'submitted' | 'approved' | 'rejected';
export type ReportStatus = 'pending' | 'completed';
export type ID = number | string;