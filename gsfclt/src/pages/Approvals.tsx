
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, XCircle, Clock, Eye, FileCheck, FileWarning } from 'lucide-react';
import Header from '@/components/Header';
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { products as initialProducts, Product } from '@/data/products';
import { hasRole } from '@/utils/auth';

// Sample approval requests
interface ApprovalRequest {
  id: string;
  productId: string;
  productName: string;
  batchNo: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  comments?: string;
  analysisData?: Record<string, any>;
}

const sampleApprovals: ApprovalRequest[] = [
  {
    id: '1',
    productId: '2',
    productName: 'Hydrochloric Acid',
    batchNo: 'B-23042',
    requestDate: '2023-07-20',
    status: 'pending',
    requestedBy: 'Lab Assistant',
    comments: 'Analysis complete. Concentration slightly below threshold.',
  },
  {
    id: '2',
    productId: '7',
    productName: 'Potassium Permanganate',
    batchNo: 'B-23107',
    requestDate: '2023-07-18',
    status: 'pending',
    requestedBy: 'Lab Assistant',
    comments: 'Color variation observed. Requesting review of assay results.',
  },
  {
    id: '3',
    productId: '4',
    productName: 'Ammonium Nitrate',
    batchNo: 'B-23074',
    requestDate: '2023-07-15',
    status: 'approved',
    requestedBy: 'Lab Assistant',
    comments: 'All parameters within acceptable ranges.',
  },
  {
    id: '4',
    productId: '1',
    productName: 'Sodium Hydroxide',
    batchNo: 'B-23051',
    requestDate: '2023-07-10',
    status: 'rejected',
    requestedBy: 'Lab Assistant',
    comments: 'Purity below minimum requirement. Recommend reprocessing.',
  },
];

const Approvals = () => {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<ApprovalRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState('pending');
  
  useEffect(() => {
    // Load approvals from localStorage or use sample data
    const storedApprovals = localStorage.getItem('approvals');
    if (storedApprovals) {
      setApprovals(JSON.parse(storedApprovals));
    } else {
      setApprovals(sampleApprovals);
      localStorage.setItem('approvals', JSON.stringify(sampleApprovals));
    }
    
    // Load products
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(initialProducts);
    }
  }, []);
  
  useEffect(() => {
    // Filter approvals based on selected tab
    if (selectedTab === 'pending') {
      setFilteredApprovals(approvals.filter(a => a.status === 'pending'));
    } else if (selectedTab === 'approved') {
      setFilteredApprovals(approvals.filter(a => a.status === 'approved'));
    } else if (selectedTab === 'rejected') {
      setFilteredApprovals(approvals.filter(a => a.status === 'rejected'));
    } else {
      setFilteredApprovals(approvals);
    }
  }, [selectedTab, approvals]);

  // Define columns for the approvals table
  const columns: ColumnDef<ApprovalRequest>[] = [
    {
      accessorKey: "requestDate",
      header: "Request Date",
      cell: ({ row }) => {
        const date = row.getValue("requestDate") as string;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      accessorKey: "productName",
      header: "Product",
    },
    {
      accessorKey: "batchNo",
      header: "Batch No",
    },
    {
      accessorKey: "requestedBy",
      header: "Requested By",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={`
            ${status === 'approved' 
              ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/30' 
              : status === 'rejected'
              ? 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/30'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/30'
            }
          `}>
            <div className="flex items-center space-x-1">
              {status === 'approved' ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : status === 'rejected' ? (
                <XCircle className="h-3 w-3 mr-1" />
              ) : (
                <Clock className="h-3 w-3 mr-1" />
              )}
              <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </div>
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const approval = row.original;
        const isPending = approval.status === 'pending';
        
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="h-8"
              onClick={() => {
                // View details logic
                toast({
                  title: "Viewing approval details",
                  description: `Viewing details for ${approval.productName}`
                });
              }}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              View
            </Button>
            
            {isPending && hasRole(['supervisor', 'manager']) && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                  onClick={() => handleUpdateStatus(approval.id, 'approved')}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                  onClick={() => handleUpdateStatus(approval.id, 'rejected')}
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  // Function to handle updating approval status
  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    const updatedApprovals = approvals.map(approval => 
      approval.id === id ? { ...approval, status } : approval
    );
    
    setApprovals(updatedApprovals);
    localStorage.setItem('approvals', JSON.stringify(updatedApprovals));
    
    const approval = approvals.find(a => a.id === id);
    
    toast({
      title: status === 'approved' ? 'Approval Granted' : 'Approval Rejected',
      description: `${approval?.productName} - ${approval?.batchNo} has been ${status}.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-chemical-50/50 to-white dark:from-chemical-900 dark:to-chemical-800 dark:text-white">
      <Header />
      
      <main className="page-container animate-fade-in">
        <div className="mb-8 flex items-center">
          <FileCheck className="h-8 w-8 mr-3 text-accent1" />
          <div>
            <h2 className="text-3xl font-display font-medium text-chemical-900 dark:text-white">
              Approvals
            </h2>
            <p className="text-chemical-600 dark:text-chemical-300">
              Review and manage quality control approval requests
            </p>
          </div>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-amber-500" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{approvals.filter(a => a.status === 'pending').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{approvals.filter(a => a.status === 'approved').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <XCircle className="h-5 w-5 mr-2 text-red-500" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{approvals.filter(a => a.status === 'rejected').length}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center">
                <FileWarning className="h-5 w-5 mr-2 text-accent1" />
                Analysis Approval Requests
              </CardTitle>
              <CardDescription>
                Review and approve or reject product analysis results
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="pending" value={selectedTab} onValueChange={setSelectedTab} className="w-full mb-6">
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <DataTable 
              columns={columns} 
              data={filteredApprovals} 
              searchPlaceholder="Search approvals..."
              searchColumn="productName"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Approvals;
