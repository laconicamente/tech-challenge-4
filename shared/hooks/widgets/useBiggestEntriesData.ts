import { useTransactionManager } from "@/modules/Transactions";
import { useAuth } from '@/modules/Users';
import { WidgetCategoryItem } from "@/shared/classes/models/widget-category";
import { fetchBiggestEntries } from "@/shared/services/widgetService";
import { useEffect, useState } from "react";

export const useBiggestEntriesData = () => {
  const { user } = useAuth();
  const { transactions } = useTransactionManager();
  const [widgetData, setWidgetData] = useState<WidgetCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getBiggestEntries = async () => {
    try {
      setIsLoading(true);
      const responseData = await fetchBiggestEntries(user?.uid || "");
      setWidgetData(responseData);
    } catch (e: unknown) {
      console.error("Ocorreu um erro ao buscar as maiores entradas.", e);
      setError((e as Error).message ?? "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBiggestEntries();
  }, [transactions]);

  return { widgetData, isLoading, error };
};
