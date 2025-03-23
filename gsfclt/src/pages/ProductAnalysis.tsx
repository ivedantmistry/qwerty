import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import AnalysisForm from '../components/AnalysisForm';
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ProductAnalysis = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}/`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        toast({
          title: "Product not found",
          description: "The requested product could not be found.",
          variant: "destructive"
        });
        navigate('/');
      }
    };
    fetchProduct();
  }, [productId, navigate, toast]);

  if (!product) return null;

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/lab-reports/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          ...formData,
          product: product.id
        }),
      });

      if (!response.ok) throw new Error('Failed to submit analysis');

      toast({
        title: "Analysis submitted successfully",
        description: `Analysis data for ${product.name} has been recorded.`,
      });

      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Could not save analysis data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-chemical-50/50 to-white dark:from-chemical-900 dark:to-chemical-800 dark:text-gray-200">
      <Header />

      <main className="page-container animate-fade-in">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center mb-6 text-chemical-600 dark:text-chemical-200 hover:text-chemical-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 bg-white dark:bg-chemical-800 rounded-xl border border-chemical-100 dark:border-chemical-700 shadow-subtle p-6">
              <h2 className="text-2xl font-display font-semibold mb-2 text-chemical-900 dark:text-white">
                {product.name}
              </h2>

              <p className="text-chemical-700 dark:text-chemical-300 mb-6">{product.description}</p>
            </div>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="bg-white dark:bg-chemical-800 rounded-xl border border-chemical-100 dark:border-chemical-700 shadow-subtle p-6">
              <h2 className="text-2xl font-display font-semibold mb-6 text-chemical-900 dark:text-white">
                Quality Control Analysis
              </h2>

              <AnalysisForm
                product={product}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductAnalysis;
