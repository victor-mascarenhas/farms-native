import { Product, ProductRepository, ProductUseCase } from '../../domain/entities/Product';

export class ProductUseCaseImpl implements ProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async getProducts(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }

  async getProduct(id: string): Promise<Product | null> {
    return await this.productRepository.findById(id);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return await this.productRepository.create(product);
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return await this.productRepository.update(id, product);
  }

  async deleteProduct(id: string): Promise<void> {
    return await this.productRepository.delete(id);
  }

  calculateMargin(product: Product): number {
    if (product.unit_price === 0) return 0;
    return ((product.unit_price - product.cost_price) / product.unit_price) * 100;
  }

  getTopProductsByMargin(products: Product[], limit: number): Product[] {
    return products
      .map(product => ({
        ...product,
        margin: this.calculateMargin(product)
      }))
      .sort((a, b) => (b.margin || 0) - (a.margin || 0))
      .slice(0, limit);
  }

  getProductsByCategory(products: Product[], category: string): Product[] {
    return products.filter(product => product.category === category);
  }

  getProductsByPriceRange(products: Product[], minPrice: number, maxPrice: number): Product[] {
    return products.filter(product => 
      product.unit_price >= minPrice && product.unit_price <= maxPrice
    );
  }

  calculateTotalInventoryValue(products: Product[], quantities: Record<string, number>): number {
    return products.reduce((total, product) => {
      const quantity = quantities[product.id!] || 0;
      return total + (product.unit_price * quantity);
    }, 0);
  }

  getLowMarginProducts(products: Product[], threshold: number = 30): Product[] {
    return products.filter(product => this.calculateMargin(product) < threshold);
  }

  getHighMarginProducts(products: Product[], threshold: number = 50): Product[] {
    return products.filter(product => this.calculateMargin(product) > threshold);
  }
} 