export interface Sale {
  id?: string;
  product_id: string;
  quantity: number;
  total_price: number;
  client_name: string;
  sale_date: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface SaleRepository {
  findAll(): Promise<Sale[]>;
  findById(id: string): Promise<Sale | null>;
  create(sale: Omit<Sale, 'id'>): Promise<Sale>;
  update(id: string, sale: Partial<Sale>): Promise<Sale>;
  delete(id: string): Promise<void>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Sale[]>;
  findByProduct(productId: string): Promise<Sale[]>;
}

export interface SaleUseCase {
  getSales(): Promise<Sale[]>;
  getSale(id: string): Promise<Sale | null>;
  createSale(sale: Omit<Sale, 'id'>): Promise<Sale>;
  updateSale(id: string, sale: Partial<Sale>): Promise<Sale>;
  deleteSale(id: string): Promise<void>;
  getSalesByPeriod(startDate: Date, endDate: Date): Promise<Sale[]>;
  getSalesByProduct(productId: string): Promise<Sale[]>;
  calculateTotalRevenue(sales: Sale[]): number;
  calculateTotalProfit(sales: Sale[], products: any[]): number;
  getTopSellingProducts(sales: Sale[], products: any[], limit: number): any[];
} 