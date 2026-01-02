import { AddTransactionUseCase, CalculateBalanceUseCase, DeleteTransactionUseCase, GetTransactionsUseCase, UpdateTransactionUseCase } from '../../domain/use-cases';
import { TransactionRepository } from '../repositories/TransactionRepository';

export const transactionRepository = new TransactionRepository();

export const calculateBalanceUseCase = new CalculateBalanceUseCase(transactionRepository);
export const getTransactionsUseCase = new GetTransactionsUseCase(transactionRepository);
export const addTransactionUseCase = new AddTransactionUseCase(transactionRepository);
export const updateTransactionUseCase = new UpdateTransactionUseCase(transactionRepository);
export const deleteTransactionUseCase = new DeleteTransactionUseCase(transactionRepository);