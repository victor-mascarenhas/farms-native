export interface Product {
  id?: string;
  name: string;
  category: string;
  unit_price: number;
  cost_price: number;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(product: Omit<Product, 'id'>): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}

export interface ProductUseCase {
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(product: Omit<Product, 'id'>): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  calculateMargin(product: Product): number;
  getTopProductsByMargin(products: Product[], limit: number): Product[];
} 