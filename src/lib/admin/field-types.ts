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
  | "image"
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
  readOnly?: boolean; // Render disabled; skip on save
  // For type: "image" — optional companion form keys for alt, credit, credit URL.
  // When set, the image widget renders inputs for those and writes through
  // onChange(altKey, …) etc. The hidden companion fields still live in the
  // entity config so they round-trip to the DB as snake_case dbColumns.
  altKey?: string;
  creditKey?: string;
  creditUrlKey?: string;
  aspectRatio?: number; // e.g. 21/9 for hero, 1 for thumbnail
}

export interface EntityConfig {
  table: string; // Supabase table name
  label: string; // Human-readable plural
  labelSingular: string;
  slug: string; // URL segment
  fields: FieldConfig[];
}
