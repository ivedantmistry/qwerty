
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { products, Product } from '@/data/products';
import { CheckCheck, AlertTriangle, Clock, TrendingUp, TrendingDown, ListChecks, LayoutDashboard } from 'lucide-react';
import Header from '../components/Header';
import { getCurrentUser } from '@/utils/auth';

// Sample data for the supervisor dashboard
const pendingApprovals = [
  { id: 1, product: "Sodium Hydroxide", date: "2023-06-15", technician: "John Doe", status: "pending" },
  { id: 2, product: "Hydrochloric Acid", date: "2023-06-14", technician: "Jane Smith", status: "pending" },
  { id: 3, product: "Sulfuric Acid", date: "2023-06-13", technician: "Alan Johnson", status: "pending" },
];

const qualityAlerts = [
  { id: 1, product: "Methanol", parameter: "Purity", expected: "99.8%", actual: "98.5%", severity: "high" },
  { id: 2, product: "Ethanol", parameter: "Water Content", expected: "<0.2%", actual: "0.3%", severity: "medium" },
  { id: 3, product: "Acetone", parameter: "Density", expected: "0.791 g/cm³", actual: "0.788 g/cm³", severity: "low" },
];

const SupervisorDashboard = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [pendingTests, setPendingTests] = useState<Product[]>([]);
  
  useEffect(() => {
    // Filter products for those needing testing (this is mock data)
    const pending = products.filter((_, index) => index % 3 === 0);
    setPendingTests(pending);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-chemical-50/50 to-white dark:from-chemical-900 dark:to-chemical-800 dark:text-white">
      <Header />
      
      <main className="page-container animate-fade-in">
        <div className="mb-8 flex items-center">
          <LayoutDashboard className="h-8 w-8 mr-3 text-accent1" />
          <div>
            <h2 className="text-3xl font-display font-medium text-chemical-900 dark:text-white">
              Supervisor Dashboard
            </h2>
            <p className="text-chemical-600 dark:text-chemical-300">
              Monitor quality control and approve test results
            </p>
          </div>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCheck className="h-5 w-5 mr-2 text-green-500" />
                Pending Approvals
              </CardTitle>
              <CardDescription>Test results waiting for review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingApprovals.length}</div>
              <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                Quality Alerts
              </CardTitle>
              <CardDescription>Products with quality issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{qualityAlerts.length}</div>
              <div className="flex items-center text-amber-500 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>2 new since yesterday</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Pending Tests
              </CardTitle>
              <CardDescription>Products awaiting testing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingTests.length}</div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span>3 fewer than yesterday</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs defaultValue="approvals" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
            <TabsTrigger value="quality-alerts">Quality Alerts</TabsTrigger>
            <TabsTrigger value="pending-tests">Pending Tests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <CheckCheck className="h-5 w-5 mr-2 text-accent1" />
                  Test Results Requiring Approval
                </CardTitle>
                <CardDescription>
                  Review and approve test results submitted by lab technicians
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left font-medium">Product</th>
                        <th className="py-3 px-4 text-left font-medium">Date Submitted</th>
                        <th className="py-3 px-4 text-left font-medium">Technician</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApprovals.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-slate-50 dark:hover:bg-chemical-800">
                          <td className="py-3 px-4">{item.product}</td>
                          <td className="py-3 px-4">{item.date}</td>
                          <td className="py-3 px-4">{item.technician}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                              Pending
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="default">Review</Button>
                              <Button size="sm" variant="outline">Details</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="quality-alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                  Quality Control Alerts
                </CardTitle>
                <CardDescription>
                  Products with parameters outside of acceptable ranges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left font-medium">Product</th>
                        <th className="py-3 px-4 text-left font-medium">Parameter</th>
                        <th className="py-3 px-4 text-left font-medium">Expected</th>
                        <th className="py-3 px-4 text-left font-medium">Actual</th>
                        <th className="py-3 px-4 text-left font-medium">Severity</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qualityAlerts.map((alert) => (
                        <tr key={alert.id} className="border-b hover:bg-slate-50 dark:hover:bg-chemical-800">
                          <td className="py-3 px-4">{alert.product}</td>
                          <td className="py-3 px-4">{alert.parameter}</td>
                          <td className="py-3 px-4">{alert.expected}</td>
                          <td className="py-3 px-4">{alert.actual}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              alert.severity === 'high' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                                : alert.severity === 'medium'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button size="sm" variant="default">Investigate</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pending-tests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <ListChecks className="h-5 w-5 mr-2 text-blue-500" />
                  Products Awaiting Testing
                </CardTitle>
                <CardDescription>
                  Assign lab technicians to perform quality control tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left font-medium">Product Code</th>
                        <th className="py-3 px-4 text-left font-medium">Product Name</th>
                        <th className="py-3 px-4 text-left font-medium">Category</th>
                        <th className="py-3 px-4 text-left font-medium">Last Tested</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingTests.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-slate-50 dark:hover:bg-chemical-800">
                          <td className="py-3 px-4">{product.code}</td>
                          <td className="py-3 px-4">{product.name}</td>
                          <td className="py-3 px-4">{product.category}</td>
                          <td className="py-3 px-4">
                            {/* Mock last tested date */}
                            {new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="default">Assign</Button>
                              <Button size="sm" variant="outline">View</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SupervisorDashboard;
