// pages/SupervisorValidation.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
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

// Fetch Pending Lab Reports
const fetchPendingLabReports = async (setReports: (reports: LabReport[]) => void, toast: any) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    toast({ title: "Error", description: "No access token found. Please sign in again.", variant: "destructive" });
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/api/products/lab-reports/?status=pending", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch pending lab reports");
    const data = await response.json();
    console.log("Fetched pending lab reports:", data); // Debug log
    setReports(data);
  } catch (error) {
    console.error("Error fetching pending lab reports:", error);
    toast({ title: "Error", description: "Failed to load pending lab reports. Please try again.", variant: "destructive" });
  }
};

// Update Lab Report Status
const updateLabReportStatus = async (reportId: number, status: "approved" | "rejected", toast: any, onSuccess: () => void) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    toast({ title: "Error", description: "No access token found. Please sign in again.", variant: "destructive" });
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/products/lab-reports/${reportId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        status: status,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update lab report: ${JSON.stringify(errorData)}`);
    }

    toast({
      title: "Success",
      description: `Lab report has been ${status}.`,
      variant: "default",
    });
    onSuccess();
  } catch (error) {
    console.error("Error updating lab report:", error);
    toast({ title: "Error", description: error.message, variant: "destructive" });
  }
};

const SupervisorValidation = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<LabReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Fetch user role and pending reports on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser: User = JSON.parse(userData);
      setUser(parsedUser);
      if (!["supervisor", "manager"].includes(parsedUser.role)) {
        toast({ title: "Access Denied", description: "This page is for supervisors and managers only.", variant: "destructive" });
        window.location.href = "/sign-in";
      }
    } else {
      window.location.href = "/sign-in";
    }

    fetchPendingLabReports(setReports, toast);
  }, [toast]);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handle Approve/Reject
  const handleUpdateStatus = (reportId: number, status: "approved" | "rejected") => {
    updateLabReportStatus(reportId, status, toast, () => {
      setReports((prev) => prev.filter((report) => report.id !== reportId));
      setSelectedReport(null);
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white p-4">
      <main className="page-container flex">
        {/* Sidebar for Pending Reports List */}
        <div className="w-1/4 p-4 border-r">
          <h2 className="text-xl font-bold mb-4">Pending Reports</h2>
          {reports.length > 0 ? (
            <ul>
              {reports.map((report) => (
                <li
                  key={report.id}
                  className={`p-2 cursor-pointer rounded ${
                    selectedReport?.id === report.id ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  {report.product_name} (Batch: {report.batch_no})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No pending reports found.</p>
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

                  {/* Approve/Reject Buttons */}
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => handleUpdateStatus(selectedReport.id, "approved")}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" /> Approve
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus(selectedReport.id, "rejected")}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <X className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-gray-500">Select a report to review.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default SupervisorValidation;