import { useTransactionManager } from "@/modules/Transactions";
import { useAuth } from '@/modules/Users';
import { CategoryWidgetItem } from "@/shared/classes/models/category";
import { fetchSpendingByCategory } from "@/shared/services/widgetService";
import { useEffect, useState } from "react";

export const useWidgetSpendingByCategory = () => {
  const { user } = useAuth();
  const { transactions } = useTransactionManager();
  const [widgetData, setWidgetData] = useState<CategoryWidgetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSpendingByCategory = async () => {
    try {
      setIsLoading(true);
      const responseData = await fetchSpendingByCategory(user?.uid || "");
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
