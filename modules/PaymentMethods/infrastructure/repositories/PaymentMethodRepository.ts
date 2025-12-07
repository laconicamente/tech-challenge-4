import { firestore } from '@/firebaseConfig';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, Timestamp, updateDoc } from 'firebase/firestore';
import { PaymentMethod, PaymentMethodRepository } from '../../domain/interfaces/IPaymentMethodRepository';

export class FirebasePaymentMethodRepository implements PaymentMethodRepository {
  private collectionName = 'methods';

  async getAll(): Promise<PaymentMethod[]> {
    const querySnapshot = await getDocs(collection(firestore, this.collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as PaymentMethod));
  }

  async getById(id: string): Promise<PaymentMethod | null> {
    const docRef = doc(firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as PaymentMethod;
  }

  async create(method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(firestore, this.collectionName), {
      ...method,
      createdAt: now,
      updatedAt: now,
    });
    
    return {
      id: docRef.id,
      ...method,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  }

  async update(id: string, method: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const docRef = doc(firestore, this.collectionName, id);
    await updateDoc(docRef, {
      ...method,
      updatedAt: Timestamp.now(),
    });
    
    const updated = await this.getById(id);
    if (!updated) throw new Error('Payment method not found after update');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(firestore, this.collectionName, id);
    await deleteDoc(docRef);
  }
}
