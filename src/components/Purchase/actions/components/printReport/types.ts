// types/purchase-request.types.ts

export type StatusType = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
export type PriorityType = 'low' | 'medium' | 'high';
export type ReviewStage = 'initial' | 'technical' | 'financial' | 'final';
export type AvailabilityType = 'available' | 'not_available' | 'partially_available';
export type RecommendationType = 'provide_from_stock' | 'purchase_new' | 'partial_from_stock';
export type UrgencyLevel = 'low' | 'medium' | 'high';
export type NeedsStatus = 'needed' | 'not_needed' | 'partially_needed';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  username: string;
  department_id: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface NeedsAssessment {
  id: number;
  purchase_request_id: number;
  request_item_id: number;
  assessed_by: number;
  urgency_level: UrgencyLevel;
  needs_status: NeedsStatus;
  quantity_needed_after_assessment: number | null;
  modified_specifications: string | null;
  reason: string;
  recommended_action: string | null;
  notes: string | null;
  assessment_state: string;
  admin_decision: string;
  admin_comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface WarehouseCheck {
  id: number;
  purchase_request_id: number;
  request_item_id: number;
  availability: AvailabilityType;
  item_condition: string | null;
  available_quantity: number;
  recommendation: RecommendationType;
  notes: string;
  checked_by: number;
  created_at: string;
  updated_at: string;
}

export interface Estimate {
  id: number;
  purchase_request_id: number;
  request_item_id: number | null;
  vendor_id: number;
  estimate_date: string;
  total_amount: string;
  notes: string;
  status: StatusType;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface RequestItem {
  id: number;
  purchase_request_id: number;
  item_name: string;
  specifications: string;
  quantity: number;
  unit: string;
  estimated_unit_price: string;
  total_estimated_price: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  needs_assessment: NeedsAssessment | null;
  warehouse_check: WarehouseCheck | null;
  estimates: Estimate[];
}

export interface Procurement {
  id: number;
  purchase_request_id: number;
  estimate_id: number | null;
  reference_no: string;
  purchase_date: string;
  total_amount: string;
  status: StatusType;
  notes: string;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface ReportData {
  summary: string;
  recommendations: string;
  [key: string]: any;
}

export interface Report {
  id: number;
  purchase_request_id: number;
  report_type: string;
  data: string | ReportData;
  file_path: string | null;
  generated_by: number;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseRequest {
  id: number;
  request_number: string;
  department_id: number | null;
  committee_id: number | null;
  user_id: number;
  title: string;
  description: string;
  total_estimated_cost: string | null;
  status_type: StatusType;
  review_stage: ReviewStage;
  status_action_by: number;
  status_role: string;
  status_date: string;
  rejected_reason: string | null;
  priority: PriorityType;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  items: RequestItem[];
  estimates: Estimate[];
  department: Department | null;
  creator: User;
  committee: any | null;
  procurements: Procurement[];
  report: Report | null;
}

// Formatted Types for UI
export interface FormattedStatus {
  label: string;
  severity: 'success' | 'warning' | 'danger' | 'info' | 'secondary';
}

export interface FormattedPriority {
  label: string;
  severity: 'success' | 'warning' | 'danger' | 'info';
}

export interface Statistics {
  totalItems: number;
  itemsWithWarehouseCheck: number;
  itemsWithNeedsAssessment: number;
  totalEstimatedCost: string;
  estimatesCount: number;
  procurementsCount: number;
}

export interface RequestInfo {
  id: number;
  requestNumber: string;
  title: string;
  description: string;
  status: FormattedStatus;
  priority: FormattedPriority;
  createdAt: string;
  statusDate: string | null;
  creator: string;
  reviewStage: ReviewStage;
}