import { useAuth } from "@/modules/Users";
import { useCallback, useEffect, useState } from "react";
import { calculateBalanceUseCase } from "../../infrastructure/factories/transactionFactories";

export function useBalanceValue() {
  const { user } = useAuth();
  const [total, setTotal] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [errorTotal, setErrorTotal] = useState<string | null>(null);

  const fetchTotal = useCallback(async () => {
    
    if (!user) {
      setTotal(0);
      setErrorTotal(null);
      return;
    }

    setIsLoadingBalance(true);
    setErrorTotal(null);

    try {
      const totalValue = await calculateBalanceUseCase.execute({ userId: user.uid });
      setTotal(totalValue);
    } catch (e: any) {
      const errorMessage = e.message ?? 
        "Ocorreu um erro ao calcular o saldo total, tente novamente por favor.";
      
      setErrorTotal(errorMessage);
      setTotal(0);
      
      console.error('Ocorreu um erro no hook useBalanceValue: ', e);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTotal();
  }, [fetchTotal]);

  return {
    total,
    isLoadingBalance,
    errorTotal,
    refetchBalanceValue: fetchTotal,
  };
}