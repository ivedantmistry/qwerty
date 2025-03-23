import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { products as initialProducts, Product } from '@/data/products';
import { useToast } from "@/hooks/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { ListChecks, AlertCircle, AlertTriangle, FileCheck, Eye, ArrowUp, ArrowDown, InspectIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Sample quality standards data for display
const qualityStandards = [
  { id: 1, category: "Acid", parameter: "Purity", minimumValue: "98.5%", maximumValue: "100.0%", testMethod: "Titration" },
  { id: 2, category: "Acid", parameter: "Water Content", minimumValue: "N/A", maximumValue: "0.1%", testMethod: "Karl Fischer" },
  { id: 3, category: "Base", parameter: "Assay", minimumValue: "98.0%", maximumValue: "100.0%", testMethod: "Titration" },
  { id: 4, category: "Organic Solvent", parameter: "Purity", minimumValue: "99.5%", maximumValue: "100.0%", testMethod: "GC-MS" },
  { id: 5, category: "Organic Solvent", parameter: "Water Content", minimumValue: "N/A", maximumValue: "0.05%", testMethod: "Karl Fischer" },
  { id: 6, category: "Salt", parameter: "Purity", minimumValue: "99.0%", maximumValue: "100.0%", testMethod: "ICP-OES" },
  { id: 7, category: "Alcohol", parameter: "Purity", minimumValue: "99.7%", maximumValue: "100.0%", testMethod: "GC-MS" },
];

// Sample quality alerts data
const qualityAlerts = [
  { id: 1, product: "Methanol", parameter: "Purity", expected: "99.8%", actual: "98.5%", severity: "high", date: "2023-07-15" },
  { id: 2, product: "Ethanol", parameter: "Water Content", expected: "<0.2%", actual: "0.3%", severity: "medium", date: "2023-07-12" },
  { id: 3, product: "Acetone", parameter: "Density", expected: "0.791 g/cm³", actual: "0.788 g/cm³", severity: "low", date: "2023-07-10" },
  { id: 4, product: "Hydrochloric Acid", parameter: "Concentration", expected: "37%", actual: "35.8%", severity: "medium", date: "2023-07-08" },
  { id: 5, product: "Sodium Hydroxide", parameter: "pH", expected: ">13", actual: "12.7", severity: "medium", date: "2023-07-05" },
];

const monthlyPerformance = [
  { month: "January", passRate: 98.2 },
  { month: "February", passRate: 97.8 },
  { month: "March", passRate: 99.1 },
  { month: "April", passRate: 98.7 },
  { month: "May", passRate: 98.9 },
  { month: "June", passRate: 99.3 },
  { month: "July", passRate: 99.5 },
];

const QualityControl = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filteredStandards, setFilteredStandards] = useState(qualityStandards);
  
  useEffect(() => {
    // Load products from localStorage or use initial data
    const storedProducts = localStorage.getItem('products');
    
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(initialProducts);
    }
    
    // Filter standards based on selected category
    if (selectedCategory === "All") {
      setFilteredStandards(qualityStandards);
    } else {
      setFilteredStandards(qualityStandards.filter(standard => standard.category === selectedCategory));
    }
  }, [selectedCategory]);
  
  const standardsColumns: ColumnDef<typeof qualityStandards[0]>[] = [
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "parameter",
      header: "Parameter",
    },
    {
      accessorKey: "minimumValue",
      header: "Minimum Value",
    },
    {
      accessorKey: "maximumValue",
      header: "Maximum Value",
    },
    {
      accessorKey: "testMethod",
      header: "Test Method",
    },
  ];
  
  const alertsColumns: ColumnDef<typeof qualityAlerts[0]>[] = [
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "product",
      header: "Product",
    },
    {
      accessorKey: "parameter",
      header: "Parameter",
    },
    {
      accessorKey: "expected",
      header: "Expected",
    },
    {
      accessorKey: "actual",
      header: "Actual",
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => {
        const severity = row.getValue("severity") as string;
        return (
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              severity === 'high' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                : severity === 'medium'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const alert = row.original;
        return (
          <Button size="sm" variant="outline" className="h-8" onClick={() => {
            toast({
              title: "Investigating Alert",
              description: `Now investigating quality alert for ${alert.product}`,
            });
          }}>
            Investigate
          </Button>
        );
      },
    },
  ];
  
  const performanceColumns: ColumnDef<typeof monthlyPerformance[0]>[] = [
    {
      accessorKey: "month",
      header: "Month",
    },
    {
      accessorKey: "passRate",
      header: "Pass Rate (%)",
    },
    {
      id: "trend",
      header: "Trend",
      cell: ({ row, table }) => {
        const currentIndex = monthlyPerformance.findIndex(p => p.month === row.original.month);
        if (currentIndex <= 0) return null;
        
        const currentRate = row.original.passRate;
        const previousRate = monthlyPerformance[currentIndex - 1].passRate;
        const diff = currentRate - previousRate;
        
        return (
          <div className="flex items-center">
            {diff > 0 ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200 gap-1">
                <ArrowUp className="h-3 w-3" />
                +{diff.toFixed(1)}%
              </Badge>
            ) : diff < 0 ? (
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 gap-1">
                <ArrowDown className="h-3 w-3" />
                {diff.toFixed(1)}%
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200">
                No change
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "visualization",
      header: "Visualization",
      cell: ({ row }) => {
        const passRate = row.original.passRate;
        return (
          <div className="w-32">
            <Progress 
              value={passRate} 
              className={
                passRate >= 99 ? "bg-green-200 dark:bg-green-950" : 
                passRate >= 98 ? "bg-blue-200 dark:bg-blue-950" : 
                "bg-amber-200 dark:bg-amber-950"
              }
            />
          </div>
        );
      },
    },
  ];
  
  const categories = ["All", ...new Set(qualityStandards.map(standard => standard.category))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-chemical-50/50 to-white dark:from-chemical-900 dark:to-chemical-800 dark:text-white">
      <Header />
      
      <main className="page-container animate-fade-in">
        <div className="mb-8 flex items-center">
          <ListChecks className="h-8 w-8 mr-3 text-accent1" />
          <div>
            <h2 className="text-3xl font-display font-medium text-chemical-900 dark:text-white">
              Quality Control
            </h2>
            <p className="text-chemical-600 dark:text-chemical-300">
              Monitor and manage product quality standards
            </p>
          </div>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                Quality Alerts
              </CardTitle>
              <CardDescription>Issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{qualityAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-green-500" />
                Pass Rate
              </CardTitle>
              <CardDescription>Current month quality pass rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{monthlyPerformance[monthlyPerformance.length - 1].passRate}%</div>
              <div className="flex items-center text-green-500 text-sm">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>
                  {(monthlyPerformance[monthlyPerformance.length - 1].passRate - 
                    monthlyPerformance[monthlyPerformance.length - 2].passRate).toFixed(1)}% vs last month
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <InspectIcon className="h-5 w-5 mr-2 text-blue-500" />
                Active Standards
              </CardTitle>
              <CardDescription>Quality specifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{qualityStandards.length}</div>
              <div className="text-sm text-muted-foreground">Across {new Set(qualityStandards.map(s => s.category)).size} categories</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="alerts">Quality Alerts</TabsTrigger>
            <TabsTrigger value="standards">Quality Standards</TabsTrigger>
            <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-accent1" />
                  Quality Control Alerts
                </CardTitle>
                <CardDescription>
                  Products with parameters outside acceptable ranges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={alertsColumns}
                  data={qualityAlerts}
                  searchPlaceholder="Search alerts..."
                  searchColumn="product"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="standards" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    <FileCheck className="h-5 w-5 mr-2 text-accent1" />
                    Quality Standards
                  </CardTitle>
                  <CardDescription>
                    Product specifications and acceptable ranges
                  </CardDescription>
                </div>
                <div className="w-48">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={standardsColumns}
                  data={filteredStandards}
                  searchPlaceholder="Search standards..."
                  searchColumn="parameter"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <InspectIcon className="h-5 w-5 mr-2 text-accent1" />
                  Monthly Performance Metrics
                </CardTitle>
                <CardDescription>
                  Product quality pass rates over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={performanceColumns}
                  data={monthlyPerformance}
                  pageSize={12}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default QualityControl;
