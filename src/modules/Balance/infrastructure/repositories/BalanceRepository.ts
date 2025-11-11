import { firestore } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  QueryFieldFilterConstraint,
  where
} from "firebase/firestore";
import { BalanceFilters, IBalanceRepository } from "../../domain/repositories/IBalanceRepository";

export class BalanceRepository implements IBalanceRepository {
  private readonly collectionName = 'transactions';

  async calculateTotalBalance(filters: BalanceFilters): Promise<number> {
    const { userId } = filters;

    // 1. Montagem das restrições (constraints) do Firestore
    const constraints: QueryFieldFilterConstraint[] = [];
    
    if (userId) {
      constraints.push(where("userId", "==", userId));
    } else {
      // Regra de segurança: Nunca buscar transações sem um userId
      throw new Error("User ID is required to calculate balance.");
    }

    try {
      // 2. Execução da Query
      const qRef = query(collection(firestore, this.collectionName), ...constraints);
      const snap = await getDocs(qRef);

      // 3. Lógica de Agregação (pertence à camada Data/Repository)
      let incomeSum = 0;
      let expenseSum = 0;

      snap.docs.forEach((doc) => {
        const data = doc.data();
        
        // Validação dos dados do documento
        if (!data.type || !data.value) {
          console.warn(`Invalid transaction data found in document ${doc.id}`);
          return;
        }
        
        // Lógica de conversão de centavos para valor real (pertence aqui)
        const value = Number(data.value) / 100 || 0;

        if (data.type === "income") {
          incomeSum += value;
        } else if (data.type === "expense") {
          expenseSum += value;
        }
      });

      // 4. Retorno do resultado puro (number) para o Domain/Use Case
      return incomeSum - expenseSum;
      
    } catch (error) {
      console.error('Error calculating balance from Firestore:', error);
      throw new Error(`Failed to fetch balance data: ${error instanceof Error ? error.message : 'Unknown database error'}`);
    }
  }
}