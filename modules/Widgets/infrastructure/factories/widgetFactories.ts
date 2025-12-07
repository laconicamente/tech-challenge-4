import {
  FetchAnalysisMonthlyUseCase,
  FetchBiggestEntriesUseCase,
  FetchFinancialResumeUseCase,
  FetchSpendingByCategoryUseCase,
} from '../../domain/use-cases';
import { WidgetRepository } from '../repositories/WidgetRepository';

const widgetRepository = new WidgetRepository();

export const fetchSpendingByCategoryUseCase = new FetchSpendingByCategoryUseCase(widgetRepository);
export const fetchBiggestEntriesUseCase = new FetchBiggestEntriesUseCase(widgetRepository);
export const fetchFinancialResumeUseCase = new FetchFinancialResumeUseCase(widgetRepository);
export const fetchAnalysisMonthlyUseCase = new FetchAnalysisMonthlyUseCase(widgetRepository);
