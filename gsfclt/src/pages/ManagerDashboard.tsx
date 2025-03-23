
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { products } from '@/data/products';
import { TrendingUp, Users, Shield, AlertCircle, ClipboardCheck, BarChart3, ActivitySquare, LayoutDashboard } from 'lucide-react';
import Header from '../components/Header';
import { getCurrentUser } from '@/utils/auth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';



const ManagerDashboard = () => {
  const [user] = useState(getCurrentUser());

  return (
    <div className="min-h-screen bg-gradient-to-b from-chemical-50/50 to-white dark:from-chemical-900 dark:to-chemical-800 dark:text-white">
      <Header />
      
      <main className="page-container animate-fade-in">
        <div className="mb-8 flex items-center">
          <LayoutDashboard className="h-8 w-8 mr-3 text-accent1" />
          <div>
            <h2 className="text-3xl font-display font-medium text-chemical-900 dark:text-white">
              Manager Dashboard
            </h2>
            <p className="text-chemical-600 dark:text-chemical-300">
              Performance analytics and department overview
            </p>
          </div>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">


          {/* Total Products */}
          {/* <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{products.length}</div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>5% increase</span>
              </div>
            </CardContent>
          </Card> */}



          {/* Staff Card */}
          {/* <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Staff Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{staffMembers.length}</div>
              <div className="flex items-center text-muted-foreground text-sm">
                <span>Across 2 departments</span>
              </div>
            </CardContent>
          </Card> */}

          {/* Quality Card */}
          {/* <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ClipboardCheck className="h-5 w-5 mr-2 text-indigo-500" />
                Quality Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">98.7%</div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>1.2% increase</span>
              </div>
            </CardContent>
          </Card> */}
          
          
        </div>
        
        {/* Charts */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-accent1" />
                Product Quality Over Time
              </CardTitle>
              <CardDescription>Average quality score by month (%)</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityOverTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[97, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avg" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <ActivitySquare className="h-5 w-5 mr-2 text-accent1" />
                Product Categories
              </CardTitle>
              <CardDescription>Distribution of products by category</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {productCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div> */}
        
        {/* Main Content */}
        <Tabs defaultValue="staff" className="w-full">
          <TabsList className="mb-6">
            {/* <TabsTrigger value="staff">Staff Management</TabsTrigger> */}
            {/* <TabsTrigger value="security">Security</TabsTrigger> */}
            {/* <TabsTrigger value="production">Production</TabsTrigger> */}
          </TabsList>
          
          {/* <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Users className="h-5 w-5 mr-2 text-accent1" />
                  Staff Members
                </CardTitle>
                <CardDescription>
                  Manage laboratory staff and review performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left font-medium">Name</th>
                        <th className="py-3 px-4 text-left font-medium">Role</th>
                        <th className="py-3 px-4 text-left font-medium">Department</th>
                        <th className="py-3 px-4 text-left font-medium">Performance</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffMembers.map((staff) => (
                        <tr key={staff.id} className="border-b hover:bg-slate-50 dark:hover:bg-chemical-800">
                          <td className="py-3 px-4">{staff.name}</td>
                          <td className="py-3 px-4">{staff.role}</td>
                          <td className="py-3 px-4">{staff.department}</td>
                          <td className="py-3 px-4">
                            <Badge className={
                              staff.performance === 'high' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200' 
                                : staff.performance === 'medium'
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-200'
                            }>
                              {staff.performance === 'high' ? 'High' : staff.performance === 'medium' ? 'Medium' : 'Low'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Badge className="cursor-pointer hover:bg-slate-200 dark:hover:bg-chemical-700">Edit</Badge>
                              <Badge className="cursor-pointer hover:bg-slate-200 dark:hover:bg-chemical-700">View</Badge>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Badge variant="outline">Total: {staffMembers.length} staff members</Badge>
                <Badge variant="outline" className="cursor-pointer">Add New Staff</Badge>
              </CardFooter>
            </Card>
          </TabsContent> */}
          
          {/* <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-accent1" />
                  Security Incidents
                </CardTitle>
                <CardDescription>
                  Track and manage security incidents across the organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                        <th className="py-3 px-4 text-left font-medium">Type</th>
                        <th className="py-3 px-4 text-left font-medium">Description</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {securityIncidents.map((incident) => (
                        <tr key={incident.id} className="border-b hover:bg-slate-50 dark:hover:bg-chemical-800">
                          <td className="py-3 px-4">{incident.date}</td>
                          <td className="py-3 px-4">{incident.type}</td>
                          <td className="py-3 px-4">{incident.description}</td>
                          <td className="py-3 px-4">
                            <Badge className={
                              incident.status === 'resolved' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-200'
                            }>
                              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Badge className="cursor-pointer hover:bg-slate-200 dark:hover:bg-chemical-700">Details</Badge>
                              {incident.status !== 'resolved' && (
                                <Badge variant="outline" className="cursor-pointer hover:bg-slate-200 dark:hover:bg-chemical-700">
                                  Resolve
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {securityIncidents.some(i => i.status === 'investigating') && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-amber-800 dark:text-amber-200 font-medium">Security Alert</p>
                      <p className="text-amber-700 dark:text-amber-300 text-sm">There is an active security investigation. Security team has been notified.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent> */}
          
          {/* <TabsContent value="production" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-accent1" />
                  Production Overview
                </CardTitle>
                <CardDescription>
                  Monthly production statistics and quality metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={productionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-muted-foreground text-sm mb-1">Production Efficiency</div>
                      <div className="text-2xl font-bold">92.4%</div>
                      <div className="text-green-500 text-xs flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>+2.1% vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-muted-foreground text-sm mb-1">Quality Compliance</div>
                      <div className="text-2xl font-bold">99.2%</div>
                      <div className="text-green-500 text-xs flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>+0.4% vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-muted-foreground text-sm mb-1">Product Returns</div>
                      <div className="text-2xl font-bold">0.3%</div>
                      <div className="text-green-500 text-xs flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>-0.1% vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </main>
    </div>
  );
};

export default ManagerDashboard;
