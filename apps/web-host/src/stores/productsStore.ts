import { create } from "zustand";
import {
  getAllFromCollection,
  addToCollection,
  updateInCollection,
  deleteFromCollection,
} from "../services/firestoreService";

export type Product = {
  id?: string;
  nome: string;
  preco: number;
  descricao?: string;
};

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
    const products = await getAllFromCollection<Product>("products");
    set({ products, loading: false });
  },
  addProduct: async (data) => {
    await addToCollection("products", data);
    await get().fetchProducts();
  },
  updateProduct: async (id, data) => {
    await updateInCollection("products", id, data);
    await get().fetchProducts();
  },
  deleteProduct: async (id) => {
    await deleteFromCollection("products", id);
    await get().fetchProducts();
  },
}));
