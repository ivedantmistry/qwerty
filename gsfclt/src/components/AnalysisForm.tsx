
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  Product, 
  AnalysisParameter, 
  getParametersForCategory 
} from '../data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info 
} from 'lucide-react';

interface AnalysisFormProps {
  product: Product;
  onSubmit: (data: any) => void;
}

interface FormValues {
  [key: string]: string | number | boolean;
}

const AnalysisForm = ({ product, onSubmit }: AnalysisFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const parameters = getParametersForCategory(product.category);
  
  const [formValues, setFormValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (paramId: string, value: string | boolean) => {
    setFormValues(prev => ({
      ...prev,
      [paramId]: value
    }));
    
    if (errors[paramId]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[paramId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    parameters.forEach(param => {
      if (param.required) {
        const value = formValues[param.id];
        
        if (value === undefined || value === '') {
          newErrors[param.id] = 'This field is required';
        } else if (param.type === 'number') {
          const numValue = Number(value);
          
          if (isNaN(numValue)) {
            newErrors[param.id] = 'Please enter a valid number';
          } else if (param.min !== undefined && numValue < param.min) {
            newErrors[param.id] = `Value must be at least ${param.min}`;
          } else if (param.max !== undefined && numValue > param.max) {
            newErrors[param.id] = `Value must be at most ${param.max}`;
          }
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call to submit analysis
      setTimeout(() => {
        setIsSubmitting(false);
        toast({
          title: "Analysis Submitted",
          description: `Analysis for ${product.name} has been successfully submitted.`,
        });
        onSubmit(formValues);
      }, 1500);
    } else {
      const firstErrorId = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorId);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const renderField = (param: AnalysisParameter) => {
    const { id, name, type, unit, options, required } = param;
    const value = formValues[id] ?? '';
    const hasError = !!errors[id];
    
    return (
      <div key={id} className="mb-6" id={id}>
        <div className="mb-1.5 flex justify-between">
          <Label 
            htmlFor={id} 
            className={`text-sm font-medium ${hasError ? 'text-destructive' : 'text-chemical-700 dark:text-chemical-300'}`}
          >
            {name}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {unit && (
            <span className="text-xs text-chemical-500 dark:text-chemical-400">{unit}</span>
          )}
        </div>
        
        {type === 'number' && (
          <Input 
            id={id}
            type="number"
            value={value.toString()}
            onChange={(e) => handleChange(id, e.target.value)}
            min={param.min}
            max={param.max}
            step="any"
            className={`input-field ${hasError ? 'border-destructive' : ''}`}
          />
        )}
        
        {type === 'text' && (
          <Input 
            id={id}
            type="text"
            value={value.toString()}
            onChange={(e) => handleChange(id, e.target.value)}
            className={`input-field ${hasError ? 'border-destructive' : ''}`}
          />
        )}
        
        {type === 'dropdown' && options && (
          <select
            id={id}
            value={value.toString()}
            onChange={(e) => handleChange(id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md dark:bg-chemical-700 dark:border-chemical-600 dark:text-chemical-100 ${hasError ? 'border-destructive' : 'border-chemical-200 dark:border-chemical-700'}`}
          >
            <option value="">Select {name}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
        
        {type === 'boolean' && (
          <div className="flex items-center space-x-4 mt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                name={id}
                checked={value === true}
                onChange={() => handleChange(id, true)}
                className="w-4 h-4 text-accent1 focus:ring-accent1"
              />
              <span className="dark:text-chemical-300">Yes</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                name={id}
                checked={value === false}
                onChange={() => handleChange(id, false)}
                className="w-4 h-4 text-accent1 focus:ring-accent1"
              />
              <span className="dark:text-chemical-300">No</span>
            </label>
          </div>
        )}
        
        {hasError && (
          <div className="mt-1 flex items-center text-destructive text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            {errors[id]}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-6 p-4 bg-chemical-50 dark:bg-chemical-900/30 rounded-lg border border-chemical-100 dark:border-chemical-700">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-chemical-500 dark:text-chemical-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-chemical-900 dark:text-chemical-100 mb-1">Analysis Instructions</h4>
            <p className="text-xs text-chemical-600 dark:text-chemical-400">
              Please fill in the analysis data for {product.name} ({product.code}). 
              Fields marked with an asterisk (*) are required. 
              Ensure all measurements are accurate and follow laboratory protocols.
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card dark:bg-chemical-800/50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-chemical-900 dark:text-chemical-100 mb-1">{product.name}</h3>
          <div className="flex items-center text-xs text-chemical-500 dark:text-chemical-400 mb-4">
            <span className="mr-3">Code: {product.code}</span>
            <span className="px-2 py-0.5 bg-chemical-50 dark:bg-chemical-800 rounded-full">
              {product.category}
            </span>
          </div>
          
          <Separator className="mb-6 dark:bg-chemical-700" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {parameters.map(param => renderField(param))}
          </div>
          
          <div className="mt-8 pt-4 border-t border-chemical-100 dark:border-chemical-700 flex justify-end">
            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/')}
                className="button-hover-effect text-chemical-700 dark:text-chemical-300 dark:border-chemical-700 dark:hover:text-accent1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="button-hover-effect bg-accent1 hover:bg-accent1/90 text-white"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Submit Analysis
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AnalysisForm;
