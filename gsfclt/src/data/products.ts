export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  lastAnalysis: string | null;
  specifications?: Record<string, string>;
  history?: Array<{ date: string; result: string }>;
  batchNo: string;
  manufacturedDate: string;
}

export const products: Product[] = [
  
];

export interface AnalysisParameter {
  id: string;
  name: string;
  type: "number" | "text" | "dropdown" | "boolean";
  unit?: string;
  options?: string[];
  required: boolean;
  min?: number;
  max?: number;
}

export const analysisParameters: Record<string, AnalysisParameter[]> = {
  

};

export const getParametersForCategory = (
  category: string
): AnalysisParameter[] => {
  return analysisParameters[category];
};
