// ParameterList.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ✅ Interfaces
interface User {
  id: number;
  username: string;
  role: "manager" | "supervisor" | "lab_assistant";
}

interface Product {
  id: number;
  product_id: string;
  name: string;
  plant: number;
}

interface ProductParameter {
  id: number;
  name: string;
  type: string;
  unit?: string;
  required: boolean;
  min_value?: number;
  max_value?: number;
  options?: string[];
  product: number;
}

// ✅ Fetch Products
const fetchProducts = async (): Promise<Product[]> => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) throw new Error("No access token found.");

  const response = await fetch("http://127.0.0.1:8000/api/products/products/", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
};

// ✅ Fetch Parameters for a Product
const fetchParameters = async (productId: number): Promise<ProductParameter[]> => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) throw new Error("No access token found.");

  const response = await fetch(
    `http://127.0.0.1:8000/api/products/parameters/?product=${productId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch parameters");
  return response.json();
};

const ParameterList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [parameters, setParameters] = useState<ProductParameter[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState<ProductParameter | null>(null);

  // ✅ Fetch user role from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user: User = JSON.parse(userData);
      setUserRole(user.role);
    } else {
      navigate("/login"); // Redirect to login if user is not authenticated
    }
  }, [navigate]);

  // ✅ Fetch products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        if (data.length > 0) {
          setSelectedProductId(data[0].id); // Pre-select the first product
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load products", variant: "destructive" });
      }
    };
    loadProducts();
  }, [toast]);

  // ✅ Fetch parameters when a product is selected
  useEffect(() => {
    if (selectedProductId) {
      const loadParameters = async () => {
        try {
          const data = await fetchParameters(selectedProductId);
          setParameters(data);
        } catch (error) {
          toast({ title: "Error", description: "Failed to load parameters", variant: "destructive" });
        }
      };
      loadParameters();
    }
  }, [selectedProductId, toast]);

  // ✅ Handle Product Selection
  const handleProductChange = (value: string) => {
    setSelectedProductId(parseInt(value));
  };

  // ✅ Open Edit Parameter Modal (Manager only)
  const openEditParameterModal = (parameter: ProductParameter) => {
    if (userRole !== "manager") {
      toast({ title: "Access Denied", description: "Only managers can edit parameters.", variant: "destructive" });
      return;
    }
    setSelectedParameter(parameter);
    setIsEditDialogOpen(true);
  };

  // ✅ Handle Update Parameter (Manager only)
  const handleUpdateParameter = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !selectedParameter) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/products/parameters/${selectedParameter.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(selectedParameter),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(`Failed to update parameter: ${JSON.stringify(result)}`);

      toast({ title: "Parameter Updated", description: "Parameter updated successfully!" });
      setParameters(
        parameters.map((param) => (param.id === selectedParameter.id ? result : param))
      );
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating parameter:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // ✅ Handle Delete Parameter (Manager only)
  const handleDeleteParameter = async (parameterId: number) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/products/parameters/${parameterId}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete parameter");

      toast({ title: "Parameter Deleted", description: "Parameter deleted successfully!" });
      setParameters(parameters.filter((param) => param.id !== parameterId));
    } catch (error) {
      console.error("Error deleting parameter:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white">
      <Header />
      <main className="page-container">
        <Card>
          <CardHeader>
            <CardTitle>Product Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ✅ Product Selection Dropdown */}
            <div className="mb-4">
              <Label htmlFor="product-select">Select Product</Label>
              <Select onValueChange={handleProductChange} value={selectedProductId?.toString()}>
                <SelectTrigger id="product-select">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} (ID: {product.product_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ✅ Parameters Table */}
            {selectedProductId && (
              <DataTable
                columns={[
                  { accessorKey: "name", header: "Parameter Name" },
                  { accessorKey: "type", header: "Type" },
                  { accessorKey: "unit", header: "Unit" },
                  { accessorKey: "required", header: "Required", cell: ({ row }) => (row.original.required ? "Yes" : "No") },
                  { accessorKey: "min_value", header: "Min Value" },
                  { accessorKey: "max_value", header: "Max Value" },
                  {
                    id: "actions",
                    cell: ({ row }) => (
                      <div className="flex space-x-2">
                        {/* ✅ Show Edit/Delete buttons only for managers */}
                        {userRole === "manager" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditParameterModal(row.original)}
                              title="Edit Parameter"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => handleDeleteParameter(row.original.id)}
                              title="Delete Parameter"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={parameters}
              />
            )}
          </CardContent>
        </Card>

        {/* ✅ Edit Parameter Modal (Manager only) */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Parameter</DialogTitle>
              <DialogDescription>Update the details of the parameter.</DialogDescription>
            </DialogHeader>
            {selectedParameter && (
              <div className="space-y-4">
                <div>
                  <Label>Parameter Name</Label>
                  <Input
                    value={selectedParameter.name}
                    onChange={(e) =>
                      setSelectedParameter({ ...selectedParameter, name: e.target.value })
                    }
                    placeholder="e.g., pH"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={selectedParameter.type}
                    onValueChange={(value) =>
                      setSelectedParameter({ ...selectedParameter, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Unit (optional)</Label>
                  <Input
                    value={selectedParameter.unit || ""}
                    onChange={(e) =>
                      setSelectedParameter({ ...selectedParameter, unit: e.target.value })
                    }
                    placeholder="e.g., %"
                  />
                </div>
                <div>
                  <Label>Min Value (optional)</Label>
                  <Input
                    type="number"
                    value={selectedParameter.min_value || ""}
                    onChange={(e) =>
                      setSelectedParameter({
                        ...selectedParameter,
                        min_value: parseFloat(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Max Value (optional)</Label>
                  <Input
                    type="number"
                    value={selectedParameter.max_value || ""}
                    onChange={(e) =>
                      setSelectedParameter({
                        ...selectedParameter,
                        max_value: parseFloat(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateParameter}>Update Parameter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ParameterList;