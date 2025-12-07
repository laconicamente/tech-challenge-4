import { PaymentMethod, PaymentMethodRepository } from '../interfaces/IPaymentMethodRepository';

export class GetPaymentMethodsUseCase {
  constructor(private paymentMethodRepository: PaymentMethodRepository) {}

  async execute(): Promise<PaymentMethod[]> {
    const methods = await this.paymentMethodRepository.getAll();
    return methods;
  }
}
