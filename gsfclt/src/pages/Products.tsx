import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [animateProducts, setAnimateProducts] = useState(false);

  // Fetch products from Django API
  useEffect(() => {
    const fetchProducts = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("No access token found. Redirecting to login.");
        return;
      }
  
      try {
        const response = await fetch("http://127.0.0.1:8000/api/products/products/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`);
  
        const data = await response.json();
        console.log("🔹 API Response:", data); // ✅ Log data to console
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);
  

  // Get unique categories
  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    // Trigger animation when component mounts
    setAnimateProducts(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-chemical-50/50 to-white dark:from-chemical-900 dark:to-chemical-800 dark:text-white">
      <Header />

      <main className="page-container animate-fade-in">
        <div className="mb-8">
          <h2 className="text-3xl font-display font-medium text-chemical-900 dark:text-white mb-2">
            Our Products
          </h2>
          <p className="text-chemical-600 dark:text-chemical-300 max-w-3xl">
            Select a product to view details and enter analysis data.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-chemical-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10 py-2 bg-white dark:bg-chemical-800 border-chemical-200 dark:border-chemical-700 rounded-lg focus:ring-2 focus:ring-accent1 focus:border-accent1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <Filter className="h-4 w-4 text-chemical-500 dark:text-chemical-300" />
            <span className="text-chemical-600 dark:text-chemical-300">
              Category:
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-accent1 text-white"
                      : "bg-white dark:bg-chemical-800 text-chemical-600 dark:text-chemical-300 border border-chemical-200 dark:border-chemical-700 hover:bg-chemical-50 dark:hover:bg-chemical-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Display Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-chemical-800 rounded-xl border border-chemical-100 dark:border-chemical-700">
            <h3 className="text-lg font-medium text-chemical-700 dark:text-chemical-300">
              No products found
            </h3>
            <p className="text-chemical-500 dark:text-chemical-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div
            className={`product-grid ${
              animateProducts ? "animate-scale-in" : "opacity-0"
            }`}
          >
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="opacity-0 animate-slide-up"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
