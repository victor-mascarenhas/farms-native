import { useState, useEffect, useCallback } from 'react';
import { ProductUseCase } from '../../domain/entities/Product';

export interface UseProductsReturn {
  products: any[];
  loading: boolean;
  error: string | null;
  createProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, product: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getTopProductsByMargin: (limit: number) => any[];
  getProductsByCategory: (category: string) => any[];
  calculateMargin: (product: any) => number;
  refreshProducts: () => Promise<void>;
}

export function useProducts(productUseCase: ProductUseCase): UseProductsReturn {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await productUseCase.getProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [productUseCase]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = useCallback(async (product: any) => {
    try {
      setError(null);
      await productUseCase.createProduct(product);
      await fetchProducts(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    }
  }, [productUseCase, fetchProducts]);

  const updateProduct = useCallback(async (id: string, product: any) => {
    try {
      setError(null);
      await productUseCase.updateProduct(id, product);
      await fetchProducts(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  }, [productUseCase, fetchProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setError(null);
      await productUseCase.deleteProduct(id);
      await fetchProducts(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  }, [productUseCase, fetchProducts]);

  const getTopProductsByMargin = useCallback((limit: number) => {
    return productUseCase.getTopProductsByMargin(products, limit);
  }, [productUseCase, products]);

  const getProductsByCategory = useCallback((category: string) => {
    return productUseCase.getProductsByCategory(products, category);
  }, [productUseCase, products]);

  const calculateMargin = useCallback((product: any) => {
    return productUseCase.calculateMargin(product);
  }, [productUseCase]);

  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    getTopProductsByMargin,
    getProductsByCategory,
    calculateMargin,
    refreshProducts,
  };
} 