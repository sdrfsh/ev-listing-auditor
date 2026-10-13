export type Vehicle = {
  id: number;
  sellerId: number;
  vin: string;
  model: string;
  mileage: number;
  batteryHealth: number;
  price: number;
  isSaleReady: boolean;
  isAvailable: boolean;
  equipments: string | null;
};

export type NewVehicle = {
  sellerId: number;
  vin: string;
  model: string;
  mileage: number;
  batteryHealth: number;
  price: number;
  isSaleReady: boolean;
  isAvailable: boolean;
  equipments?: string;
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