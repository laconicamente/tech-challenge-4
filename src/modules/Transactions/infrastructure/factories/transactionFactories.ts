import { CalculateBalanceUseCase } from '../../domain/use-cases/CalculateBalanceUseCase';
import { TransactionRepository } from '../repositories/TransactionRepository';

// Instancia o TransactionRepository
const transactionRepository = new TransactionRepository();

// Injeta no UseCase
export const calculateBalanceUseCase = new CalculateBalanceUseCase(transactionRepository);