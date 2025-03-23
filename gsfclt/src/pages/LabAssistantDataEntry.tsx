// pages/LabAssistantDataEntry.tsx
import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interface for the User
interface User {
  id: number;
  username: string;
  role: "manager" | "supervisor" | "lab_assistant";
}

// Product Interface
interface Product {
  id: number;
  product_id: string;
  name: string;
  plant_id: number;
}

// Product Parameter Interface
interface ProductParameter {
  id: number;
  name: string;
  type: string;
  unit?: string;
  required: boolean | null;
  min_value?: number;
  max_value?: number;
  options?: string[];
  product_id: number;
}

// Parameter Value Interface
interface ParameterValue {
  parameter: number;
  product: number;
  value: string;
}

// Fetch Products
const fetchProducts = async (setProducts: (products: Product[]) => void, toast: any) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    toast({ title: "Error", description: "No access token found. Please sign in again.", variant: "destructive" });
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/api/products/products/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch products");
    const data = await response.json();
    setProducts(data);
  } catch (error) {
    console.error("Error fetching products:", error);
    toast({ title: "Error", description: "Failed to load products. Please try again.", variant: "destructive" });
  }
};

// Fetch Parameters for a Product
const fetchParameters = async (productId: number): Promise<ProductParameter[]> => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) throw new Error("No access token found.");

  console.log(`Fetching parameters for productId: ${productId}`);
  const response = await fetch(
    `http://127.0.0.1:8000/api/products/parameters/?product_id=${productId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) throw new Error(`Failed to fetch parameters: ${response.status} ${response.statusText}`);
  const data = await response.json();
  console.log(`Parameters for productId ${productId}:`, data);
  return data;
};

const LabAssistantDataEntry = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [parameters, setParameters] = useState<ProductParameter[]>([]);
  const [parameterValues, setParameterValues] = useState<ParameterValue[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [batchNo, setBatchNo] = useState<string>("");

  // Fetch user and products on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser: User = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      window.location.href = "/sign-in";
    }

    fetchProducts(setProducts, toast);
  }, [toast]);

  // Fetch parameters when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      console.log(`Selected product changed: ${selectedProduct.id} - ${selectedProduct.name}`);
      const loadParameters = async () => {
        try {
          setParameters([]);
          setParameterValues([]);

          const paramsData = await fetchParameters(selectedProduct.id);
          setParameters(paramsData);
          setParameterValues(
            paramsData.map((param) => ({
              parameter: param.id,
              product: selectedProduct.id,
              value: "",
            }))
          );
        } catch (error) {
          console.error("Error loading parameters:", error);
          toast({ title: "Error", description: "Failed to load parameters", variant: "destructive" });
        }
      };
      loadParameters();
    } else {
      setParameters([]);
      setParameterValues([]);
    }
  }, [selectedProduct, toast]);

  // Handle parameter value change
  const handleValueChange = (parameterId: number, value: string) => {
    setParameterValues((prev) =>
      prev.map((pv) =>
        pv.parameter === parameterId ? { ...pv, value } : pv
      )
    );
  };

  // Handle Save Data
  const handleSaveData = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !selectedProduct || !user) return;

    if (!batchNo) {
      toast({ title: "Error", description: "Batch number is required.", variant: "destructive" });
      return;
    }

    try {
      // Validate parameter values
      for (const paramValue of parameterValues) {
        const param = parameters.find((p) => p.id === paramValue.parameter);
        if (param?.required && !paramValue.value) {
          toast({ title: "Error", description: `Parameter ${param.name} is required.`, variant: "destructive" });
          return;
        }

        if (param?.type === "number" && paramValue.value) {
          const numValue = parseFloat(paramValue.value);
          if (param.min_value !== undefined && numValue < param.min_value) {
            toast({ title: "Error", description: `Value for ${param.name} must be at least ${param.min_value}.`, variant: "destructive" });
            return;
          }
          if (param.max_value !== undefined && numValue > param.max_value) {
            toast({ title: "Error", description: `Value for ${param.name} must be at most ${param.max_value}.`, variant: "destructive" });
            return;
          }
        }
      }

      console.log("Parameter values to be sent:", parameterValues);

      const response = await fetch("http://127.0.0.1:8000/api/products/lab-reports/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          product: selectedProduct.id,
          batch_no: batchNo,
          submitted_by: user.id,
          status: "pending",
          parameter_values: parameterValues
            .filter((pv) => pv.value)
            .map((pv) => ({
              parameter: pv.parameter,
              value: pv.value,
            })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to save lab report: ${JSON.stringify(errorData)}`);
      }

      const responseData = await response.json();
      console.log("Lab report creation response:", responseData);

      toast({ title: "Success", description: "Lab report submitted successfully!", variant: "default" });
      setParameterValues(
        parameterValues.map((pv) => ({ ...pv, value: "" }))
      );
      setBatchNo("");
    } catch (error) {
      console.error("Error saving data:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Determine if the user can submit (only lab assistants can submit)
  const canSubmit = user?.role === "lab_assistant";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white p-4">
      <main className="page-container flex">
        {/* Sidebar for Product List */}
        <div className="w-1/4 p-4 border-r">
          <h2 className="text-xl font-bold mb-4">Products</h2>
          {products.length > 0 ? (
            <ul>
              {products.map((product) => (
                <li
                  key={product.id}
                  className={`p-2 cursor-pointer rounded ${
                    selectedProduct?.id === product.id ? "bg-blue-800" : "hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.name} ({product.product_id})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No products found.</p>
          )}
        </div>

        {/* Data Entry Section */}
        <div className="w-3/4 p-4">
          {selectedProduct ? (
            <Card>
              <CardHeader>
                <CardTitle>Data Entry for {selectedProduct.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Batch Number Input */}
                  <div className="space-y-2">
                    <Label>Batch Number <span className="text-red-500">*</span></Label>
                    <Input
                      type="text"
                      value={batchNo}
                      onChange={(e) => setBatchNo(e.target.value)}
                      placeholder="Enter batch number"
                      disabled={!canSubmit} // Disable for non-lab assistants
                    />
                  </div>

                  {parameters.length > 0 ? (
                    <>
                      {parameters.map((param) => (
                        <div key={param.id} className="space-y-2">
                          <Label>
                            {param.name} {param.unit && `(${param.unit})`} {(param.required === true) && <span className="text-red-500">*</span>}
                          </Label>
                          {param.type === "number" ? (
                            <Input
                              type="number"
                              value={
                                parameterValues.find((pv) => pv.parameter === param.id)?.value || ""
                              }
                              onChange={(e) => handleValueChange(param.id, e.target.value)}
                              placeholder={`Enter value (${param.min_value || '-∞'} to ${param.max_value || '∞'})`}
                              disabled={!canSubmit} // Disable for non-lab assistants
                            />
                          ) : (
                            <Select
                              value={
                                parameterValues.find((pv) => pv.parameter === param.id)?.value || ""
                              }
                              onValueChange={(value) => handleValueChange(param.id, value)}
                              disabled={!canSubmit} // Disable for non-lab assistants
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                {param.options?.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      ))}
                      <Button onClick={handleSaveData} disabled={!canSubmit}>
                        <Save className="h-4 w-4 mr-2" /> Submit Lab Report
                      </Button>
                      {!canSubmit && (
                        <p className="text-gray-500 text-sm">
                          Only lab assistants can submit lab reports.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">No parameters defined for this product.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-gray-500">Select a product to enter data.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default LabAssistantDataEntry;