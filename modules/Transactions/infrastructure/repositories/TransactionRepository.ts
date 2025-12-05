import { firestore } from "@/firebaseConfig";
import { formatDate } from "@/shared/helpers/formatDate";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryFieldFilterConstraint,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  ITransactionRepository,
  PaginatedTransactions,
  Transaction,
  TransactionFilters,
} from "../../domain/interfaces/ITransactionRepository";

export class TransactionRepository implements ITransactionRepository {
  private readonly collectionName = "transactions";

  /**
   * Remove campos undefined de um objeto para evitar erros do Firestore
   */
  private cleanTransactionFields(
    obj: Record<string, any>
  ): Record<string, string> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Busca o nome de uma categoria pelo ID
   */
  private async getCategoryName(categoryId: string): Promise<string | null> {
    try {
      const categoryDoc = await getDoc(
        doc(firestore, "categories", categoryId)
      );
      if (categoryDoc.exists()) {
        return categoryDoc.data()?.name || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Busca o nome de um método de pagamento pelo ID
   */
  private async getMethodName(methodId: string): Promise<string | null> {
    try {
      const methodDoc = await getDoc(doc(firestore, "methods", methodId));
      if (methodDoc.exists()) {
        return methodDoc.data()?.name || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Busca transações de um usuário com filtros e paginação
   */
  async getTransactionsByUser(
    filters: TransactionFilters
  ): Promise<PaginatedTransactions> {
    const {
      userId,
      categoryId,
      methodId,
      startDate,
      endDate,
      minValue,
      maxValue,
      pageSize = 10,
      lastDocId,
    } = filters;

    const constraints: QueryFieldFilterConstraint[] = [
      where("userId", "==", userId.trim()),
    ];

    if (categoryId) constraints.push(where("categoryId", "==", categoryId));
    if (methodId) constraints.push(where("methodId", "==", methodId));

    if (startDate) {
      const start = new Date(startDate);
      constraints.push(where("createdAt", ">=", start));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      constraints.push(where("createdAt", "<=", end));
    }

    if (minValue !== undefined)
      constraints.push(where("value", ">=", minValue));
    if (maxValue !== undefined)
      constraints.push(where("value", "<=", maxValue));

    const queryConstraints: any[] = [
      ...constraints,
      orderBy("createdAt", "desc"),
    ];

    if (lastDocId) {
      const lastDocRef = doc(firestore, this.collectionName, lastDocId);
      const lastDocSnap = await getDocs(
        query(
          collection(firestore, this.collectionName),
          where("__name__", "==", lastDocId)
        )
      );
      if (!lastDocSnap.empty) {
        queryConstraints.push(startAfter(lastDocSnap.docs[0]));
      }
    }

    queryConstraints.push(limit(pageSize));

    const qRef = query(
      collection(firestore, this.collectionName),
      ...queryConstraints
    );
    const snap = await getDocs(qRef);

    const transactions: Transaction[] = await Promise.all(
      snap.docs.map(async (doc) => {
        const data = doc.data();
        const createdAtDate = data.createdAt?.toDate() || new Date();

        const [categoryName, methodName] = await Promise.all([
          data.categoryId
            ? this.getCategoryName(data.categoryId)
            : Promise.resolve(null),
          data.methodId
            ? this.getMethodName(data.methodId)
            : Promise.resolve(null),
        ]);

        return {
          id: doc.id,
          userId: data.userId,
          type: data.type,
          value: Number(data.value) || 0,
          categoryId: data.categoryId,
          methodId: data.methodId,
          description: data.description,
          createdAt: createdAtDate,
          categoryName: categoryName,
          methodName: methodName,
          createdAtDisplay: formatDate(createdAtDate),
        };
      })
    );

    const hasMore = snap.docs.length === pageSize;
    const newLastDocId =
      snap.docs.length > 0 ? snap.docs[snap.docs.length - 1].id : undefined;

    return {
      transactions,
      lastDocId: newLastDocId,
      hasMore,
    };
  }

  /**
   * Adiciona uma nova transação
   */
  async addTransaction(transaction: Omit<Transaction, "id">): Promise<string> {
    try {
      const transactionData = this.cleanTransactionFields({
        ...transaction,
        createdAt: transaction.createdAt || Timestamp.now(),
      });

      const docRef = await addDoc(
        collection(firestore, this.collectionName),
        transactionData
      );

      return docRef.id;
    } catch (error) {
      throw new Error(
        `Falha ao adicionar transação: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }

  /**
   * Atualiza uma transação existente
   */
  async updateTransaction(
    id: string,
    transaction: Partial<Transaction>
  ): Promise<void> {
    const docRef = doc(firestore, this.collectionName, id);

    const transactionData = this.cleanTransactionFields(transaction);

    await updateDoc(docRef, transactionData);
  }

  /**
   * Deleta uma transação
   */
  async deleteTransaction(id: string): Promise<void> {
    const docRef = doc(firestore, this.collectionName, id);
    await deleteDoc(docRef);
  }
}
