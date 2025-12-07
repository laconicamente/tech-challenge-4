import { firestore } from "@/firebaseConfig";
import { getCategoryByIdUseCase } from "@/modules/Categories";
import { Transaction } from "@/modules/Transactions";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  AnalysisMonthlyData,
  FinancialResumeData,
  IWidgetRepository,
  WidgetCategoryItem,
} from "../../domain/interfaces/IWidgetRepository";

export class WidgetRepository implements IWidgetRepository {
  private readonly collectionName = "transactions";

  /**
   * Gera gradiente de cores para as categorias
   */
  private generateShades(index: number, totalItems: number): string {
    if (totalItems <= 1) return "#7a60602f";

    const rStart = 0x5f;
    const rEnd = 0x7a;

    const gStart = 0x6b;
    const gEnd = 0x1b;
    const bStart = 0x6b;
    const bEnd = 0x1b;

    const ratio = index / (totalItems - 1);

    const lerp = (a: number, b: number, t: number) =>
      Math.round(a + (b - a) * t);
    const r = lerp(rStart, rEnd, ratio);
    const g = lerp(gStart, gEnd, ratio);
    const b = lerp(bStart, bEnd, ratio);

    const toHex = (v: number) => v.toString(16).padStart(2, "0");

    return `#${toHex(r)}${toHex(g)}${toHex(b)}2f`;
  }

  /**
   * Busca gastos agrupados por categoria
   */
  async fetchSpendingByCategory(
    userId: string
  ): Promise<WidgetCategoryItem[]> {
    const transactionsRef = collection(firestore, this.collectionName);

    const q = query(
      transactionsRef,
      where("userId", "==", userId),
      where("type", "==", "expense")
    );

    const querySnapshot = await getDocs(q);

    const spendingData: { [key: string]: WidgetCategoryItem } = {};

    await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data() as Transaction;
        const categoryId = data.categoryId;
        if (categoryId) {
          const category = await getCategoryByIdUseCase.execute(categoryId);

          const spendingValue =
            (spendingData[categoryId]?.value || 0) + Number(data.value) / 100;

          spendingData[categoryId] = {
            name: category?.name || "Sem categoria",
            value: spendingValue,
            color: "",
          };
        }
      })
    );

    const sortedSpending = Object.values(spendingData).sort(
      (a, b) => b.value - a.value
    );

    return sortedSpending.map((item, index) => {
      return {
        ...item,
        color: this.generateShades(index, sortedSpending.length),
      };
    });
  }

  /**
   * Busca as 3 maiores entradas por categoria
   */
  async fetchBiggestEntries(userId: string): Promise<WidgetCategoryItem[]> {
    const transactionsRef = collection(firestore, this.collectionName);

    const q = query(
      transactionsRef,
      where("userId", "==", userId),
      where("type", "==", "income")
    );

    const querySnapshot = await getDocs(q);

    const entryData: { [key: string]: WidgetCategoryItem } = {};

    await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const data = doc.data() as Transaction;
        const categoryId = data.categoryId;
        if (categoryId) {
          const category = await getCategoryByIdUseCase.execute(categoryId);

          const entryValue =
            (entryData[categoryId]?.value || 0) + Number(data.value) / 100;

          entryData[categoryId] = {
            id: categoryId,
            name: category?.name || "Sem categoria",
            value: entryValue,
            icon: category?.icon || "",
          };
        }
      })
    );

    return Object.values(entryData)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }

  /**
   * Busca resumo financeiro por período
   */
  async fetchFinancialResume(
    type: "income" | "expense",
    userId: string,
    start: Date,
    end: Date
  ): Promise<FinancialResumeData> {
    const col = collection(firestore, this.collectionName);
    const startWithTime = start
      ? new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
          -3,
          0,
          0,
          0
        )
      : undefined;
    const endWithTime = end
      ? new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate(),
          23,
          59,
          59,
          999
        )
      : undefined;
    const qRef = query(
      col,
      where("userId", "==", userId),
      where("type", "==", type),
      where("createdAt", ">=", startWithTime),
      where("createdAt", "<=", endWithTime),
      orderBy("createdAt", "asc")
    );
    const snap = await getDocs(qRef);
    const map: Record<string, number> = {};

    snap.forEach((d) => {
      const t: any = d.data();
      const created = t.createdAt?.seconds
        ? new Date(t.createdAt.seconds * 1000)
        : new Date(t.createdAt || Date.now());

      if (created < start || created > end) return;

      const key = created.toISOString().slice(0, 10);
      const value = (t.value || 0) / 100;
      map[key] = (map[key] || 0) + value;
    });

    const totalValue = Object.values(map).reduce((a, b) => a + b, 0);

    const data = Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([iso, total]) => ({
        timestamp: new Date(iso).getTime(),
        value: total,
      }));

    return { totalValue, data };
  }

  /**
   * Busca análise mensal dos últimos 30 dias
   */
  async fetchAnalysisMonthly(userId: string): Promise<AnalysisMonthlyData> {
    const date = new Date();
    const start = new Date();
    start.setDate(date.getDate() - 29);
    const col = collection(firestore, this.collectionName);
    const startDate = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      -3,
      0,
      0,
      0
    );
    const endDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    );
    const qRef = query(
      col,
      where("userId", "==", userId),
      where("createdAt", ">=", startDate),
      where("createdAt", "<=", endDate),
      orderBy("createdAt", "asc")
    );
    const querySnapshot = await getDocs(qRef);

    const transactionExpense = querySnapshot.docs.filter(
      (doc) => doc.data().type === "expense"
    );
    const transactionIncome = querySnapshot.docs.filter(
      (doc) => doc.data().type === "income"
    );

    const totalExpense = transactionExpense.reduce(
      (sum, doc) => sum + (doc.data().value || 0) / 100,
      0
    );
    const totalIncome = transactionIncome.reduce(
      (sum, doc) => sum + (doc.data().value || 0) / 100,
      0
    );

    return {
      monthExpense: totalExpense,
      monthIncome: totalIncome,
      differenceValue: totalIncome - totalExpense,
      totalValue: totalIncome + totalExpense,
    };
  }
}
