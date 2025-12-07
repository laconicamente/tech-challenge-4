import { useTransactionManager } from "@/modules/Transactions";
import { useAuth } from '@/modules/Users';
import { useEffect, useState } from "react";
import { WidgetCategoryItem } from "../../domain/interfaces/IWidgetRepository";
import { fetchSpendingByCategoryUseCase } from "../../infrastructure/factories/widgetFactories";

export const useWidgetSpendingByCategory = () => {
  const { user } = useAuth();
  const { transactions } = useTransactionManager();
  const [widgetData, setWidgetData] = useState<WidgetCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSpendingByCategory = async () => {
    try {
      setIsLoading(true);
      const responseData = await fetchSpendingByCategoryUseCase.execute(user?.uid || "");
      setWidgetData(responseData);
    } catch (e: unknown) {
      console.error("Ocorreu um erro ao buscar o widget de gastos por categoria.", e);
      setError((e as Error).message ?? "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSpendingByCategory();
  }, [user, transactions]);

  return { widgetData, isLoading, error };
};
