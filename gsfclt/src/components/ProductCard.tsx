import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Product } from '../data/products';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  


  const handleSelect = () => {
    navigate(`/analysis/${product.id}`);
  };

  return (
    <div 
      className={`glass-card rounded-xl p-5 flex flex-col h-full transition-all duration-300 ${
        isHovered ? 'translate-y-[-2px] shadow-elevated' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-chemical-500 dark:text-chemical-400">{product.code}</span>
          
        </div>
        <h3 className="text-lg font-medium text-chemical-900 dark:text-white">{product.name}</h3>
      </div>
      
      <div className="flex items-center text-xs text-chemical-500 dark:text-chemical-400 mb-3">
        <span className="px-2 py-0.5 bg-chemical-50 dark:bg-chemical-800 rounded-full">
          {product.category}
        </span>
      </div>
      
      <p className="text-sm text-chemical-600 dark:text-chemical-300 mb-4 flex-grow">
        {product.description}
      </p>
      
      <div className="pt-2 mt-auto border-t border-chemical-100 dark:border-chemical-700">
        <div className="flex items-center justify-between">
          <div className="text-xs text-chemical-500 dark:text-chemical-400">
            {product.lastAnalysis ? (
              <span>Last analyzed: {new Date(product.lastAnalysis).toLocaleDateString()}</span>
            ) : (
              <span>No previous analysis</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSelect}
              variant="outline"
              className="button-hover-effect text-sm flex items-center space-x-1 bg-white dark:bg-chemical-800 border-chemical-200 dark:border-chemical-700 text-chemical-700 dark:text-chemical-300 hover:text-accent1 dark:hover:text-accent1 hover:border-accent1/50 dark:hover:border-accent1/50 transition-all duration-300"
            >
              <span>Select</span>
              <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${isHovered ? 'translate-x-0.5' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;