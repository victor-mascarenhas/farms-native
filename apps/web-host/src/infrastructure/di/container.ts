import { ProductRepository, ProductUseCase } from '../../domain/entities/Product';
import { SaleRepository, SaleUseCase } from '../../domain/entities/Sale';
import { FirebaseProductRepository } from '../repositories/FirebaseProductRepository';
import { ProductUseCaseImpl } from '../../application/useCases/ProductUseCaseImpl';

// Container de Injeção de Dependência
class DIContainer {
  private static instance: DIContainer;
  private repositories: Map<string, any> = new Map();
  private useCases: Map<string, any> = new Map();

  private constructor() {
    this.initializeRepositories();
    this.initializeUseCases();
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  private initializeRepositories() {
    // Repositórios
    this.repositories.set('ProductRepository', new FirebaseProductRepository());
    // Adicione outros repositórios aqui
  }

  private initializeUseCases() {
    // Casos de uso
    const productRepository = this.repositories.get('ProductRepository') as ProductRepository;
    this.useCases.set('ProductUseCase', new ProductUseCaseImpl(productRepository));
    // Adicione outros casos de uso aqui
  }

  getProductRepository(): ProductRepository {
    return this.repositories.get('ProductRepository');
  }

  getProductUseCase(): ProductUseCase {
    return this.useCases.get('ProductUseCase');
  }

  // Métodos para adicionar novos repositórios e casos de uso
  registerRepository(name: string, repository: any) {
    this.repositories.set(name, repository);
  }

  registerUseCase(name: string, useCase: any) {
    this.useCases.set(name, useCase);
  }

  getRepository(name: string): any {
    return this.repositories.get(name);
  }

  getUseCase(name: string): any {
    return this.useCases.get(name);
  }
}

export const container = DIContainer.getInstance(); 