// ProductManagement.tsx
import { useState, useEffect } from "react";
import { Edit, Trash2, Plus, Settings, Eye, ArrowLeft, X } from "lucide-react";
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
  plant: number;
}

// Product Parameter Interface
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

// Fetch Products
const fetchProducts = async (setProducts: (products: Product[]) => void) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    console.error("No access token found.");
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
  }
};

// Fetch Parameters for a Product
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

// Product Parameters Component (Embedded within ProductManagement)
const ProductParameters = ({
  product,
  onBack,
}: {
  product: Product;
  onBack: () => void;
}) => {
  const { toast } = useToast();
  const [parameters, setParameters] = useState<ProductParameter[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState<ProductParameter | null>(null);
  const [editOptions, setEditOptions] = useState<string[]>([]); // For editing options dynamically

  // Fetch parameters on component mount
  useEffect(() => {
    const loadParameters = async () => {
      try {
        const paramsData = await fetchParameters(product.id);
        setParameters(paramsData);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load parameters", variant: "destructive" });
      }
    };
    loadParameters();
  }, [product.id, toast]);

  // Open Edit Parameter Modal
  const openEditParameterModal = (parameter: ProductParameter) => {
    setSelectedParameter(parameter);
    setEditOptions(parameter.options || []);
    setIsEditDialogOpen(true);
  };

  // Handle Update Parameter
  const handleUpdateParameter = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !selectedParameter) return;

    try {
      const updatedParameter = {
        ...selectedParameter,
        options: selectedParameter.type === "dropdown" ? editOptions : null,
      };

      const response = await fetch(
        `http://127.0.0.1:8000/api/products/parameters/${selectedParameter.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updatedParameter),
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

  // Handle Delete Parameter
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

  // Add a new option while editing
  const addEditOption = () => {
    setEditOptions([...editOptions, ""]);
  };

  // Remove an option while editing
  const removeEditOption = (index: number) => {
    setEditOptions(editOptions.filter((_, i) => i !== index));
  };

  // Update an option while editing
  const updateEditOption = (index: number, value: string) => {
    const updatedOptions = [...editOptions];
    updatedOptions[index] = value;
    setEditOptions(updatedOptions);
  };

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <CardTitle>Parameters for {product.name}</CardTitle>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </CardHeader>
      <CardContent>
        {parameters.length > 0 ? (
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
                  </div>
                ),
              },
            ]}
            data={parameters}
          />
        ) : (
          <p className="text-center text-gray-500">No parameters defined for this product.</p>
        )}
      </CardContent>

      {/* Edit Parameter Modal */}
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
                    setSelectedParameter({ ...selectedParameter, type: value, unit: "", min_value: undefined, max_value: undefined, options: [] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="dropdown">Options</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedParameter.type === "number" && (
                <>
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
                </>
              )}
              {selectedParameter.type === "dropdown" && (
                <div>
                  <Label>Options</Label>
                  {editOptions.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <Input
                        value={option}
                        onChange={(e) => updateEditOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEditOption(index)}
                        className="text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addEditOption}>
                    <Plus className="h-4 w-4 mr-2" /> Add Option
                  </Button>
                </div>
              )}
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
    </Card>
  );
};

const ProductManagement = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDefineParamsDialogOpen, setIsDefineParamsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    product_id: "",
    plant: 1,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [parameters, setParameters] = useState<ProductParameter[]>([]);
  const [newParameter, setNewParameter] = useState<Partial<ProductParameter>>({
    name: "",
    type: "number", // Default to "number"
    unit: "",
    required: false,
    min_value: undefined,
    max_value: undefined,
    options: [],
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [viewingParameters, setViewingParameters] = useState<Product | null>(null);
  const [optionsList, setOptionsList] = useState<string[]>([]); // For dynamic options in "Define Parameters"

  // Fetch user role from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user: User = JSON.parse(userData);
      setUserRole(user.role);
      if (user.role !== "manager") {
        toast({ title: "Access Denied", description: "This page is for managers only.", variant: "destructive" });
        window.location.href = "/sign-in";
      }
    } else {
      window.location.href = "/sign-in";
    }
  }, [toast]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts(setProducts);
  }, []);

  // Open Add Product Modal
  const openAddProductModal = () => {
    setNewProduct({ name: "", product_id: "", plant: 1 });
    setIsAddDialogOpen(true);
  };

  // Handle Add Product
  const handleAddProduct = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/products/products/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newProduct),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(`Failed to add product: ${JSON.stringify(result)}`);

      toast({ title: "Product Added", description: "New product added successfully!" });
      fetchProducts(setProducts);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding product:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Open Define Parameters Modal
  const openDefineParametersModal = async (product: Product) => {
    setSelectedProduct(product);
    const params = await fetchParameters(product.id);
    setParameters(params);
    setOptionsList([]); // Reset options list
    setIsDefineParamsDialogOpen(true);
  };

  // Handle Add Parameter
  const handleAddParameter = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !selectedProduct) return;

    try {
      const payload = {
        ...newParameter,
        product: selectedProduct.id,
        required: newParameter.required || false,
        options: newParameter.type === "dropdown" ? optionsList : null,
      };

      const response = await fetch("http://127.0.0.1:8000/api/products/parameters/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(`Failed to add parameter: ${JSON.stringify(result)}`);

      toast({ title: "Parameter Added", description: "Parameter added successfully!" });
      setParameters([...parameters, result]);
      setNewParameter({ name: "", type: "number", unit: "", required: false, min_value: undefined, max_value: undefined, options: [] });
      setOptionsList([]);
      setIsDefineParamsDialogOpen(false); // Close the modal after adding
    } catch (error) {
      console.error("Error adding parameter:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId: number) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/products/products/${productId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete product");

      toast({ title: "Product Deleted", description: "Product deleted successfully!" });
      fetchProducts(setProducts);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Handle View Parameters
  const handleViewParameters = (product: Product) => {
    setViewingParameters(product);
  };

  // Handle Back to Product List
  const handleBackToProducts = () => {
    setViewingParameters(null);
  };

  // Add a new option in "Define Parameters"
  const addOption = () => {
    setOptionsList([...optionsList, ""]);
  };

  // Remove an option in "Define Parameters"
  const removeOption = (index: number) => {
    setOptionsList(optionsList.filter((_, i) => i !== index));
  };

  // Update an option in "Define Parameters"
  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...optionsList];
    updatedOptions[index] = value;
    setOptionsList(updatedOptions);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white">
      <Header />
      <main className="page-container">
        {viewingParameters ? (
          <ProductParameters product={viewingParameters} onBack={handleBackToProducts} />
        ) : (
          <Card>
            <CardHeader className="flex justify-between">
              <CardTitle>Product Management</CardTitle>
              <Button onClick={openAddProductModal}>
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { accessorKey: "id", header: "ID" },
                  { accessorKey: "product_id", header: "Product ID" },
                  { accessorKey: "name", header: "Product Name" },
                  {
                    id: "actions",
                    cell: ({ row }) => (
                      <div className="flex space-x-2">
                        {/* View Parameters Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewParameters(row.original)}
                          title="View Parameters"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {/* Define Parameters Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDefineParametersModal(row.original)}
                          title="Define Parameters"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        {/* Delete Product Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDeleteProduct(row.original.id)}
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={products}
              />
            </CardContent>
          </Card>
        )}

        {/* Add Product Modal */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Enter the details to add a new product.</DialogDescription>
            </DialogHeader>
            <Label>Product Name</Label>
            <Input
              value={newProduct.name || ""}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <Label>Product ID</Label>
            <Input
              value={newProduct.product_id || ""}
              onChange={(e) => setNewProduct({ ...newProduct, product_id: e.target.value })}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct}>Add Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Define Parameters Modal */}
        <Dialog open={isDefineParamsDialogOpen} onOpenChange={setIsDefineParamsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Define Parameters for {selectedProduct?.name}</DialogTitle>
              <DialogDescription>Add parameters for this product.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Parameter Name</Label>
                <Input
                  value={newParameter.name || ""}
                  onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
                  placeholder="e.g., Color"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={newParameter.type}
                  onValueChange={(value) => setNewParameter({ ...newParameter, type: value, unit: "", min_value: undefined, max_value: undefined, options: [] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="dropdown">Options</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newParameter.type === "number" && (
                <>
                  <div>
                    <Label>Unit (optional)</Label>
                    <Input
                      value={newParameter.unit || ""}
                      onChange={(e) => setNewParameter({ ...newParameter, unit: e.target.value })}
                      placeholder="e.g., %"
                    />
                  </div>
                  <div>
                    <Label>Min Value (optional)</Label>
                    <Input
                      type="number"
                      value={newParameter.min_value || ""}
                      onChange={(e) => setNewParameter({ ...newParameter, min_value: parseFloat(e.target.value) || undefined })}
                    />
                  </div>
                  <div>
                    <Label>Max Value (optional)</Label>
                    <Input
                      type="number"
                      value={newParameter.max_value || ""}
                      onChange={(e) => setNewParameter({ ...newParameter, max_value: parseFloat(e.target.value) || undefined })}
                    />
                  </div>
                </>
              )}
              {newParameter.type === "dropdown" && (
                <div>
                  <Label>Options</Label>
                  {optionsList.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-2" /> Add Option
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDefineParamsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddParameter}>Add Parameter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ProductManagement;