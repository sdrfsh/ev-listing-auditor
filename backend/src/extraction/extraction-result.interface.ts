import { EditableField } from '../common/editable-field.enum.js';

// One change the seller asked for
export interface Edit {
  field: EditableField;
  value: string;
}

// Everything found in one seller message
export interface Extraction {
  vin: string | null; // null = the seller didn't write a VIN
  edits: Edit[]; // at least one; each becomes its own issue
}
