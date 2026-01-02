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
  onSnapshot,
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

  private static cache = new Map<string, {
    data: PaginatedTransactions;
    updatedAt: number;
  }>();
  
  private static readonly CACHE_TTL_MS = 60 * 1000;

  /**
   * Gera chave de cache baseada nos filtros
   */
  private getCacheKey(filters: TransactionFilters): string {
    return JSON.stringify({
      userId: filters.userId,
      categoryId: filters.categoryId,
      methodId: filters.methodId,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
      minValue: filters.minValue,
      maxValue: filters.maxValue,
      pageSize: filters.pageSize,
      lastDocId: filters.lastDocId,
    });
  }

  /**
   * Invalida cache relacionado a um usuário
   */
  private invalidateUserCache(userId: string): void {
    const keysToDelete: string[] = [];
    TransactionRepository.cache.forEach((_, key) => {
      try {
        const parsed = JSON.parse(key);
        if (parsed.userId === userId) {
          keysToDelete.push(key);
        }
      } catch {
      }
    });
    keysToDelete.forEach(key => TransactionRepository.cache.delete(key));
  }

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
    const cacheKey = this.getCacheKey(filters);
    const cached = TransactionRepository.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.updatedAt < TransactionRepository.CACHE_TTL_MS) {
      return cached.data;
    }

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

    const result: PaginatedTransactions = {
      transactions,
      lastDocId: newLastDocId,
      hasMore,
    };

    TransactionRepository.cache.set(cacheKey, {
      data: result,
      updatedAt: Date.now(),
    });

    return result;
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

      if (transaction.userId) {
        this.invalidateUserCache(transaction.userId);
      }

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

    if (transaction.userId) {
      this.invalidateUserCache(transaction.userId);
    }
  }

  /**
   * Deleta uma transação
   */
  async deleteTransaction(id: string): Promise<void> {
    const docRef = doc(firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    const userId = docSnap.data()?.userId;
    
    await deleteDoc(docRef);

    if (userId) {
      this.invalidateUserCache(userId);
    }
  }

  /**
   * Subscreve a mudanças em tempo real nas transações de um usuário
   * @param filters - Filtros incluindo userId obrigatório
   * @param callback - Função chamada sempre que houver mudanças
   * @returns Função para cancelar a subscrição
   */
  subscribeTransactions(
    filters: TransactionFilters,
    callback: (transactions: Transaction[]) => void
  ): () => void {
    const {
      userId,
      categoryId,
      methodId,
      startDate,
      endDate,
      minValue,
      maxValue,
      pageSize = 10,
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
      limit(pageSize),
    ];

    const q = query(
      collection(firestore, this.collectionName),
      ...queryConstraints
    );

    return onSnapshot(
      q,
      async (snapshot) => {
        const transactions: Transaction[] = await Promise.all(
          snapshot.docs.map(async (doc) => {
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

        callback(transactions);
      },
      (error) => {
        console.error("Erro no stream de transações:", error);
      }
    );
  }
}
