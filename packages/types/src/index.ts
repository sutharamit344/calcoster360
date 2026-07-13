export type CostCategory = 'Material' | 'Labour' | 'Machine' | 'Process' | 'Other' | 'Tax' | 'Profit';
export type FieldType = 'Currency' | 'Number' | 'Percentage' | 'Formula';

export interface CostField {
  id: string;
  companyId: string;
  label: string;
  category: CostCategory;
  type: FieldType;
  unit: string; // e.g. Sheet, Litre, Hour, Unit, etc.
  defaultValue: number;
  currency: string; // e.g. ₹
  isShared: boolean;
  usedIn: string[]; // calculatorIds
  description?: string;
  isRequired?: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export type OperatorType = '+' | '-' | '*' | '/' | '=';

export interface BaseBlock {
  id: string;
  operatorBefore?: OperatorType; // operator connecting to previous block/group
}

export interface FieldBlock extends BaseBlock {
  type: 'field';
  fieldId: string;
  valueOverride?: number; // Used during builder or runner
  label?: string; // Cache for UI display speed
  category?: CostCategory;
  unit?: string;
  currency?: string;
}

export interface GroupBlock extends BaseBlock {
  type: 'group';
  name: string;
  blocks: CalculatorBlock[];
}

export type CalculatorBlock = FieldBlock | GroupBlock;

export interface CostProfile {
  id: string;
  calculatorId: string;
  name: string;
  values: Record<string, number>; // fieldId -> preset input value
  notes?: string;
  lastUsed?: string;
  createdBy: string;
  createdAt: string;
}

export interface CalculatorHistoryEntry {
  version: number;
  updatedAt: string;
  updatedBy: string;
  description: string;
  changes: Array<{
    fieldLabel: string;
    type: 'added' | 'removed' | 'modified';
    from?: string | number;
    to?: string | number;
  }>;
  restoreState: {
    blocks: CalculatorBlock[];
  };
}

export interface CalculatorSettings {
  defaultCurrency: string;
  requireAllFields: boolean;
  allowCustomMargins: boolean;
}

export interface Calculator {
  id: string;
  name: string;
  description: string;
  industry: string;
  blocks: CalculatorBlock[];
  profiles: CostProfile[];
  history: CalculatorHistoryEntry[];
  settings: CalculatorSettings;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  isActive: boolean;
}

export interface CalculationResultBreakdown {
  category: CostCategory;
  label: string;
  amount: number;
  percentageOfTotal: number;
}

export interface CalculationResult {
  calculatorId: string;
  inputs: Record<string, number>; // fieldId -> actual input value
  outputs: Record<string, number>; // fieldId -> calculated amount (e.g. including multiplier)
  totalCost: number;
  breakdown: CalculationResultBreakdown[];
  timestamp: string;
}

export interface Quotation {
  id: string;
  companyId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  calculatorId: string;
  calculatorName: string;
  profileId?: string;
  profileName?: string;
  inputs: Record<string, number>;
  totalCost: number;
  breakdown: CalculationResultBreakdown[];
  status: 'Draft' | 'Sent' | 'Approved' | 'Declined';
  validUntil: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface ActivityLog {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  currency: string;
  plan: 'Free' | 'Professional' | 'Enterprise';
  maxCalculators: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'Owner' | 'Admin' | 'Member';
  companyId: string;
}
