import { create } from "zustand";
import { type Product } from "@farms/schemas";

type ProductsStore = {
  products: Product[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (data: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
};

export const useProductsStore = create<ProductsStore>((set, get) => ({
  products: [],
  loading: false,
  fetchProducts: async () => {
    set({ loading: true });
    const res = await fetch("/api/products");
    const products: Product[] = await res.json();
    set({ products, loading: false });
  },
  addProduct: async (data: Omit<Product, "id">) => {
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await get().fetchProducts();
  },
  updateProduct: async (id: string, data: Partial<Product>) => {
    await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    await get().fetchProducts();
  },
  deleteProduct: async (id: string) => {
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await get().fetchProducts();
  },
}));
