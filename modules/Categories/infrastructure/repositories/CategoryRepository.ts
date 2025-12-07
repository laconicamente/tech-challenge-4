import { firestore } from '@/firebaseConfig';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, Timestamp, updateDoc } from 'firebase/firestore';
import { Category, CategoryRepository } from '../../domain/interfaces/ICategoryRepository';

export class FirebaseCategoryRepository implements CategoryRepository {
  private collectionName = 'categories';

  async getAll(): Promise<Category[]> {
    const querySnapshot = await getDocs(collection(firestore, this.collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Category));
  }

  async getById(id: string): Promise<Category | null> {
    const docRef = doc(firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Category;
  }

  async create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(firestore, this.collectionName), {
      ...category,
      createdAt: now,
      updatedAt: now,
    });
    
    return {
      id: docRef.id,
      ...category,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  }

  async update(id: string, category: Partial<Category>): Promise<Category> {
    const docRef = doc(firestore, this.collectionName, id);
    await updateDoc(docRef, {
      ...category,
      updatedAt: Timestamp.now(),
    });
    
    const updated = await this.getById(id);
    if (!updated) throw new Error('Category not found after update');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(firestore, this.collectionName, id);
    await deleteDoc(docRef);
  }
}
