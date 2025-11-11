import { CalculateTotalBalanceUseCase } from '../../domain/useCases/CalculateTotalBalanceUseCase';
import { BalanceRepository } from '../repositories/BalanceRepository';

const balanceRepository = new BalanceRepository();
const calculateTotalBalanceUseCase = new CalculateTotalBalanceUseCase(balanceRepository);

export { balanceRepository, calculateTotalBalanceUseCase };
