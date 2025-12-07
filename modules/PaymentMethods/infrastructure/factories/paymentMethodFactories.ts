import {
    CreatePaymentMethodUseCase,
    DeletePaymentMethodUseCase,
    GetPaymentMethodByIdUseCase,
    GetPaymentMethodsUseCase,
    UpdatePaymentMethodUseCase,
} from '../../domain/use-cases';
import { FirebasePaymentMethodRepository } from '../repositories/PaymentMethodRepository';

const paymentMethodRepository = new FirebasePaymentMethodRepository();

export const getPaymentMethodsUseCase = new GetPaymentMethodsUseCase(paymentMethodRepository);
export const getPaymentMethodByIdUseCase = new GetPaymentMethodByIdUseCase(paymentMethodRepository);
export const createPaymentMethodUseCase = new CreatePaymentMethodUseCase(paymentMethodRepository);
export const updatePaymentMethodUseCase = new UpdatePaymentMethodUseCase(paymentMethodRepository);
export const deletePaymentMethodUseCase = new DeletePaymentMethodUseCase(paymentMethodRepository);
