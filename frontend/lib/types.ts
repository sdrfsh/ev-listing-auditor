export type VinSpec = {
  vin: string;
  make: string;
  model: string;
  trim: string;
  modelYear: number;
  batteryKwh: number;
  listPrice: number;
  equipmentSpecs: string[];
};

export type Vehicle = {
  id: number;
  sellerId: number;
  VIN: string;
  mileage: number;
  batteryHealth: number;
  price: number;
  isSaleReady: boolean;
  isAvailable: boolean;
  equipments: string | null;
  vinSpec?: VinSpec;
};

export type IssueStatus = "pending" | "confirmed" | "rejected";
export type EditableField = "mileage" | "batteryHealth" | "equipments";

export type Issue = {
  id: number;
  sellerId: number;
  fieldName: EditableField;   
  oldValue: string | null;   
  newValue: string;           
  sellerMessage: string;
  status: IssueStatus;
  createdAt: string;          
  resolvedAt: string | null;  
  vehicle?: Vehicle;          
};

export type ReportResult =
  | { ok: true; issues: Issue[] }
  | { ok: false; needsVin: boolean; message: string };