import { useEffect, useState } from 'react';
import { PaymentMethod } from '../../domain/interfaces/IPaymentMethodRepository';
import {
  createPaymentMethodUseCase,
  deletePaymentMethodUseCase,
  getPaymentMethodsUseCase,
  updatePaymentMethodUseCase,
} from '../../infrastructure/factories/paymentMethodFactories';

export const usePaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMethods = async () => {
    try {
      setIsLoading(true);
      const data = await getPaymentMethodsUseCase.execute();
      setMethods(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const createMethod = async (method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMethod = await createPaymentMethodUseCase.execute(method);
    setMethods(prev => [...prev, newMethod]);
    return newMethod;
  };

  const updateMethod = async (id: string, data: Partial<PaymentMethod>) => {
    const updated = await updatePaymentMethodUseCase.execute(id, data);
    setMethods(prev => prev.map(m => m.id === id ? updated : m));
    return updated;
  };

  const deleteMethod = async (id: string) => {
    await deletePaymentMethodUseCase.execute(id);
    setMethods(prev => prev.filter(m => m.id !== id));
  };

  return {
    methods,
    isLoading,
    error,
    refetch: fetchMethods,
    createMethod,
    updateMethod,
    deleteMethod,
  };
};
