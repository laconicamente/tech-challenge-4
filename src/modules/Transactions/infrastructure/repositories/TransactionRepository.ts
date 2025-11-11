import { firestore } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  QueryFieldFilterConstraint,
  where
} from "firebase/firestore";
import { ITransactionRepository, Transaction, TransactionFilters } from "../../domain/interfaces/ITransactionRepository";

export class TransactionRepository implements ITransactionRepository {
  private readonly collectionName = 'transactions';

  /**
   * Busca todas as transações de um usuário
   * Repository "puro" - apenas acesso a dados
   * @param filters - Filtros incluindo userId obrigatório
   * @returns Promise com array de transações
   */
  async getTransactionsByUser(filters: TransactionFilters): Promise<Transaction[]> {
    const { userId } = filters;

    if (!userId || userId.trim() === '') {
      throw new Error('UserId é obrigatório para buscar transações');
    }

    const constraints: QueryFieldFilterConstraint[] = [
      where("userId", "==", userId.trim())
    ];

    try {
      const qRef = query(collection(firestore, this.collectionName), ...constraints);
      const snap = await getDocs(qRef);

      const transactions: Transaction[] = [];

      snap.docs.forEach((doc) => {
        const data = doc.data();
        
        // Validação básica dos dados
        if (!data.type || !data.value || data.userId !== userId.trim()) {
          return;
        }

        transactions.push({
          id: doc.id,
          userId: data.userId,
          type: data.type,
          value: Number(data.value) || 0,
          description: data.description,
          createdAt: data.createdAt?.toDate()
        });
      });

      return transactions;
      
    } catch (error) {
      console.error('Error fetching transactions from Firestore:', error);
      throw new Error(`Falha ao buscar transações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}