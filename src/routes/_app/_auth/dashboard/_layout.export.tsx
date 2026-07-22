import { useState } from "react";
import { useQuery } from "convex/react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "@cvx/_generated/api";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/export")({
  component: ExportData,
  beforeLoad: () => ({
    title: "Antaios - Export Data",
    headerTitle: "Export Data",
    headerDescription:
      "Download all your organization's data as CSV files for backup or analysis. This includes shipments, documents, audit logs, and risk assessments.",
  }),
});

function toCsv(data: any[], filename: string) {
  if (data.length === 0) return;
  const keys = Object.keys(data[0]);
  const csvContent = [
    keys.join(","),
    ...data.map((row) =>
      keys
        .map((key) => {
          const val = row[key];
          if (val === null || val === undefined) return "";
          const str =
            typeof val === "object" ? JSON.stringify(val) : String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ExportData() {
  const [loading, setLoading] = useState(false);
  const data = useQuery(api.exports.getOrgExportData);

  const handleExport = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const shipments = data.shipments.map((s: any) => ({
        ...s,
        ...(s.extractedData
          ? Object.fromEntries(
              Object.entries(s.extractedData).map(([k, v]) => [
                `extracted_${k}`,
                typeof v === "object" ? JSON.stringify(v) : v,
              ]),
            )
          : {}),
      }));
      toCsv(shipments, "shipments.csv");
      toCsv(data.documents, "documents.csv");
      toCsv(data.auditLogs, "audit_logs.csv");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <section className="w-full rounded-xl border border-border/50 bg-card shadow-xs">
        <div className="flex flex-col gap-6 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Download className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-foreground">
                Export Data
              </h2>
              <p className="text-xs text-muted-foreground">
                Download all your organization's data as CSV files for backup or
                analysis. This includes shipments, documents, audit logs, and
                risk assessments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-b-xl border-t border-border/50 bg-muted/50 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            {loading
              ? "Preparing your files..."
              : data
                ? `${data.shipments.length} shipments, ${data.documents.length} documents, ${data.auditLogs.length} audit log entries`
                : "Loading your data..."}
          </p>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={loading || !data}
          >
            <Download className="mr-1.5 h-4 w-4" />
            {loading ? "Exporting..." : "Download CSV"}
          </Button>
        </div>
      </section>
    </div>
  );
}
