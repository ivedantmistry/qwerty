// pages/Reports.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Interface for the User
interface User {
  id: number;
  username: string;
  role: "manager" | "supervisor" | "lab_assistant";
}

// Interface for Lab Report Parameter
interface LabReportParameter {
  parameter: number;
  parameter_name: string;
  value: string;
  unit: string | null;
}

// Interface for Lab Report
interface LabReport {
  id: number;
  product: number;
  product_name: string;
  batch_no: string;
  submitted_by: number;
  submitted_by_username: string;
  submitted_at: string;
  approved_by: number | null;
  approved_by_username: string | null;
  approved_at: string | null;
  status: "pending" | "approved" | "rejected";
  parameter_values: LabReportParameter[];
}

// Fetch Lab Reports
const fetchLabReports = async (setReports: (reports: LabReport[]) => void, toast: any) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    toast({ title: "Error", description: "No access token found. Please sign in again.", variant: "destructive" });
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/api/products/lab-reports/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch lab reports");
    const data = await response.json();
    console.log("Fetched lab reports:", data); // Debug log
    setReports(data);
  } catch (error) {
    console.error("Error fetching lab reports:", error);
    toast({ title: "Error", description: "Failed to load lab reports. Please try again.", variant: "destructive" });
  }
};

const Reports = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<LabReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Fetch user role and reports on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser: User = JSON.parse(userData);
      setUser(parsedUser);
      if (!["lab_assistant", "manager", "supervisor"].includes(parsedUser.role)) {
        toast({ title: "Access Denied", description: "You do not have permission to view reports.", variant: "destructive" });
        window.location.href = "/sign-in";
      }
    } else {
      window.location.href = "/sign-in";
    }

    fetchLabReports(setReports, toast);
  }, [toast]);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white p-4">
      <main className="page-container flex">
        {/* Sidebar for Report List */}
        <div className="w-1/4 p-4 border-r">
          <h2 className="text-xl font-bold mb-4">Reports</h2>
          {reports.length > 0 ? (
            <ul>
              {reports.map((report) => (
                <li
                  key={report.id}
                  className={`p-2 cursor-pointer rounded ${
                    selectedReport?.id === report.id ? "bg-blue-700" : "hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  {report.product_name} (Batch: {report.batch_no}) - {report.status}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No reports found.</p>
          )}
        </div>

        {/* Report Details Section */}
        <div className="w-3/4 p-4">
          {selectedReport ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Report for {selectedReport.product_name} (Batch: {selectedReport.batch_no})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Report Metadata */}
                  <div className="space-y-2">
                    <div>
                      <Label className="font-bold">Submitted By:</Label>{" "}
                      {selectedReport.submitted_by_username || "N/A"}
                    </div>
                    <div>
                      <Label className="font-bold">Submitted At:</Label>{" "}
                      {formatDate(selectedReport.submitted_at)}
                    </div>
                    <div>
                      <Label className="font-bold">Status:</Label>{" "}
                      <span
                        className={`capitalize ${
                          selectedReport.status === "pending"
                            ? "text-yellow-500"
                            : selectedReport.status === "approved"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {selectedReport.status}
                      </span>
                    </div>
                    {selectedReport.status !== "pending" && (
                      <>
                        <div>
                          <Label className="font-bold">Approved/Rejected By:</Label>{" "}
                          {selectedReport.approved_by_username || "N/A"}
                        </div>
                        <div>
                          <Label className="font-bold">Approved/Rejected At:</Label>{" "}
                          {formatDate(selectedReport.approved_at)}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Parameter Values */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Parameter Values</h3>
                    {selectedReport.parameter_values && selectedReport.parameter_values.length > 0 ? (
                      selectedReport.parameter_values.map((param) => (
                        <div key={param.parameter} className="space-y-1">
                          <Label className="font-bold">
                            {param.parameter_name} {param.unit && `(${param.unit})`}:
                          </Label>{" "}
                          {param.value || "N/A"}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No parameter values recorded.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-gray-500">Select a report to view details.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;