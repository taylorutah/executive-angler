export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "url"
  | "email"
  | "select"
  | "boolean"
  | "string-array"
  | "json"
  | "date"
  | "relation"
  | "hidden";

export interface FieldConfig {
  key: string; // camelCase TypeScript property name
  dbColumn: string; // snake_case Supabase column name
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // For select fields
  relationTable?: string; // For relation fields
  relationLabelKey?: string;
  placeholder?: string;
  tableColumn?: boolean; // Show in list table
  fullWidth?: boolean; // Span full form width
}

export interface EntityConfig {
  table: string; // Supabase table name
  label: string; // Human-readable plural
  labelSingular: string;
  slug: string; // URL segment
  fields: FieldConfig[];
}
