export function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  if (rows.length === 0) return "";

  const keys = columns ?? Object.keys(rows[0]);

  const header = keys.join(",");

  const body = rows.map((row) =>
    keys
      .map((k) => {
        const val = row[k];
        if (val === null || val === undefined) return "";
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(",")
  );

  return [header, ...body].join("\n");
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const CONTACT_EXPORT_COLUMNS = [
  "full_name",
  "email",
  "phone",
  "city",
  "state",
  "lead_source",
  "status",
  "notes",
  "created_at",
];

export const POLICY_EXPORT_COLUMNS = [
  "contact_name",
  "insurance_company",
  "line_of_insurance",
  "policy_number",
  "annual_premium",
  "policy_status",
  "start_date",
  "renewal_date",
  "notes",
  "created_at",
];
