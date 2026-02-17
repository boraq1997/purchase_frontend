import type {
  PriorityLevel,
  StatusType,
  UrgencyLevel,
  NeedsStatusType,
  WarehouseAvailability,
  WarehouseCondition,
  PurchaseItemStatus,
  OfferStatus,
  ReportStatus,
  ID,
} from '../types/purchase.types';

/** تعريف المستخدم */
export interface User {
  id: ID;
  name: string;
  username: string;
  email: string;
}

/** تعريف القسم مع بعض الحقول الاختيارية والعلاقات */
export interface Department {
  id: ID;
  name: string;
  username?: string;
  code?: string;
  manager_user_id?: ID;
  description?: string;
  manager?: User;
  users?: User[];
}

/** اللجنة المرتبطة بالطلب، لها ارتباط بالقسم والمستخدمين */
export interface Committee {
  id: ID;
  name: string;
  department_id: ID;
  description?: string;
  manager_user_id?: ID;
  department?: Department;
  users?: User[];
  manager?: User;
}

/** تعريف المادة داخل الطلب */
export interface PurchaseItem {
  id?: ID;
  item_name: string;
  quantity: number;
  unit: string;
  specs: string[];
  needs_status?: NeedsStatusType;
  purchase_status?: PurchaseItemStatus;
  warehouse_status?: WarehouseAvailability;
  offers_status?: OfferStatus;
  report_status?: ReportStatus;
  estimated_unit_price?: number;
  total_estimated_price?: number;
}

/** تقييم لجنة بيان الحاجة للمادة */
export interface NeedsAssessment {
  id: ID;
  request_item_id: ID;
  urgency_level: UrgencyLevel;
  needs_status: NeedsStatusType;
  quantity_needed_after_assessment: number;
  modified_specifications?: string[];
  reason?: string;
  recommended_action?: string;
  notes?: string;
  committee_member?: User;
  created_at?: string;
  assessed_by?: ID;
  assessment_state?: string;
  admin_decision?: string;
  admin_comment?: string;
  assessedBy?: User;
}

/** فحص المخازن للمادة */
export interface WarehouseCheck {
  id: ID;
  request_item_id: ID;
  availability: WarehouseAvailability;
  condition: WarehouseCondition;
  available_quantity: number;
  notes?: string;
  recommendation?: string;
  committee_member?: User;
  created_at?: string;
  checked_by?: ID;
  checkedBy?: User;
}

/** عنصر فردي ضمن عرض السعر (estimate) */
export interface EstimateItem {
  id: ID;
  estimate_id: ID;
  request_item_id: ID;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

/** عرض سعر مقدم من المورد */
export interface Estimate {
  id: ID;
  purchase_request_id: ID;
  request_item_id: ID;
  vendor_name: string;
  vendor_phone?: string;
  vendor_email?: string;
  vendor_address?: string;
  estimate_date?: string;
  total_amount?: number;
  notes?: string;
  status?: string;
  estimate_items?: EstimateItem[];
  committee_member?: User;
  created_at?: string;
}

/** عنصر في سجل الشراء (Procurement) */
export interface ProcurementItem {
  id: ID;
  procurement_id: ID;
  request_item_id: ID;
  item_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  difference?: number;
  notes?: string;
}

/** سجل شراء ينشأ بعد الموافقة على عرض سعر */
export interface Procurement {
  id: ID;
  purchase_request_id: ID;
  estimate_id: ID;
  reference_no: string;
  purchase_date: string;
  total_amount: number;
  status: string;
  notes?: string;
  created_by: ID;
  items?: ProcurementItem[];
  purchaseRequest?: PurchaseRequest;
  estimate?: Estimate;
  creator?: User;
}

/** الكيان الرئيسي لطلب الشراء */
export interface PurchaseRequest {
  id: ID;
  request_number: string;
  title: string;
  description: string;
  department: Department;
  department_id?: ID;
  committee_id?: ID;
  creator: User;
  user_id?: ID;
  priority: PriorityLevel;
  total_estimated_cost?: number;
  created_at: string;
  updated_at?: string;
  status_type: StatusType;
  status_action_by?: ID;
  status_role?: string;
  status_date?: string;
  rejected_reason?: string;
  closed_at?: string;
  items: PurchaseItem[];
  needs_assessments?: NeedsAssessment[];
  warehouse_checks?: WarehouseCheck[];
  estimates?: Estimate[];
  procurements?: Procurement[];
  committee?: Committee;
  statusActor?: User;
  report?: Report;
}

/** تقرير مرتبط بطلب الشراء */
export interface Report {
  id: ID;
  // يمكن إضافة حقول أخرى لاحقًا حسب الحاجة
}