import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@farms/firebase';
import { Product, ProductRepository } from '../../domain/entities/Product';

export class FirebaseProductRepository implements ProductRepository {
  private collectionName = 'products';

  async findAll(): Promise<Product[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDocs(query(collection(db, this.collectionName), where('__name__', '==', id)));
      
      if (docSnap.empty) {
        return null;
      }

      const doc = docSnap.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...product,
        created_at: new Date(),
        updated_at: new Date()
      });

      return {
        id: docRef.id,
        ...product,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  async update(id: string, product: Partial<Product>): Promise<Product> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...product,
        updated_at: new Date()
      });

      const updatedProduct = await this.findById(id);
      if (!updatedProduct) {
        throw new Error('Product not found after update');
      }

      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }
} 