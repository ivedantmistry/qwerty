import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Filter, FileSpreadsheet } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { products, Product, analysisParameters, getParametersForCategory } from '@/data/products';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const ProductReports = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  
  // Mock reports data - in a real application, this would come from an API
  const [reports, setReports] = useState<any[]>([]);
  
  useEffect(() => {
    // Find the product by ID
    const foundProduct = products.find(p => p.id === productId);
    if (foundProduct) {
      setProduct(foundProduct);
      
      // Mock reports data
      const mockReports = [
        {
          id: '1',
          date: new Date().toISOString(),
          status: 'Approved',
          analyst: 'John Doe',
          parameters: {
            purity: '98.5%',
            ph: '7.2',
            density: '1.05 g/mL'
          }
        },
        {
          id: '2',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          status: 'Rejected',
          analyst: 'Jane Smith',
          parameters: {
            purity: '92.1%',
            ph: '6.8',
            density: '1.03 g/mL'
          }
        },
        {
          id: '3',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
          status: 'Approved',
          analyst: 'Mike Johnson',
          parameters: {
            purity: '99.1%',
            ph: '7.1',
            density: '1.04 g/mL'
          }
        }
      ];
      
      setReports(mockReports);
    }
  }, [productId]);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleExportReports = () => {
    toast({
      title: "Export Started",
      description: "Your reports are being prepared for download."
    });
    // In a real app, this would trigger an actual export
  };
  
  const filteredReports = selectedStatus === 'All' 
    ? reports 
    : reports.filter(report => report.status === selectedStatus);
  
  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-chemical-50/50 to-white dark:from-chemical-900 dark:to-chemical-800 dark:text-white">
        <Header />
        <main className="page-container animate-fade-in">
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium text-chemical-900 dark:text-white mb-2">
              Product not found
            </h2>
            <Button onClick={handleGoBack}>Go Back</Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-chemical-50/50 to-white dark:from-chemical-900 dark:to-chemical-800 dark:text-white">
      <Header />
      
      <main className="page-container animate-fade-in">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4" 
            onClick={handleGoBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div>
            <h2 className="text-3xl font-display font-medium text-chemical-900 dark:text-white mb-1">
              {product.name} Reports
            </h2>
            <div className="flex items-center text-chemical-500 dark:text-chemical-400">
              <span className="text-xs font-medium mr-2">{product.code}</span>
              <span className="px-2 py-0.5 bg-chemical-50 dark:bg-chemical-800 rounded-full text-xs">
                {product.category}
              </span>
            </div>
          </div>
          
          <Button 
            className="ml-auto bg-accent1 hover:bg-accent1/90"
            onClick={handleExportReports}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-chemical-900 dark:text-white mb-1">
                  {reports.length}
                </div>
                <div className="text-sm text-chemical-500 dark:text-chemical-400">
                  Total Reports
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {reports.filter(r => r.status === 'Approved').length}
                </div>
                <div className="text-sm text-chemical-500 dark:text-chemical-400">
                  Approved
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {reports.filter(r => r.status === 'Rejected').length}
                </div>
                <div className="text-sm text-chemical-500 dark:text-chemical-400">
                  Rejected
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-white dark:bg-chemical-800 rounded-xl shadow-subtle border border-chemical-100 dark:border-chemical-700 overflow-hidden mb-8">
          <div className="p-4 border-b border-chemical-100 dark:border-chemical-700 flex items-center justify-between">
            <h3 className="text-lg font-medium text-chemical-900 dark:text-white">
              Analysis Reports
            </h3>
            
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4 text-chemical-500 dark:text-chemical-300" />
              <span className="text-chemical-600 dark:text-chemical-300">Status:</span>
              <div className="flex flex-wrap gap-2">
                {['All', 'Approved', 'Rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                      selectedStatus === status
                        ? 'bg-accent1 text-white'
                        : 'bg-white dark:bg-chemical-800 text-chemical-600 dark:text-chemical-300 border border-chemical-200 dark:border-chemical-700 hover:bg-chemical-50 dark:hover:bg-chemical-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-chemical-300 dark:text-chemical-600 mb-4" />
              <h3 className="text-lg font-medium text-chemical-700 dark:text-chemical-300">No reports found</h3>
              <p className="text-chemical-500 dark:text-chemical-400 mt-1">Try adjusting your filter or check back later</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-chemical-50 dark:bg-chemical-700/50">
                <TableRow>
                  <TableHead className="text-chemical-700 dark:text-chemical-300">Date</TableHead>
                  <TableHead className="text-chemical-700 dark:text-chemical-300">Status</TableHead>
                  <TableHead className="text-chemical-700 dark:text-chemical-300">Analyst</TableHead>
                  <TableHead className="text-chemical-700 dark:text-chemical-300">Parameters</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-chemical-50 dark:hover:bg-chemical-700/30">
                    <TableCell className="font-medium text-chemical-900 dark:text-white">
                      {new Date(report.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'Approved' 
                          ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900' 
                          : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900'
                      }`}>
                        {report.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-chemical-700 dark:text-chemical-300">
                      {report.analyst}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {Object.entries(report.parameters).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-xs text-chemical-500 dark:text-chemical-400 min-w-20">{key}:</span>
                            <span className="text-xs font-medium text-chemical-900 dark:text-white">{value as React.ReactNode}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductReports;