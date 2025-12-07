import { PaymentMethod, PaymentMethodRepository } from '../interfaces/IPaymentMethodRepository';

export class GetPaymentMethodByIdUseCase {
  constructor(private paymentMethodRepository: PaymentMethodRepository) {}

  async execute(id: string): Promise<PaymentMethod | null> {
    if (!id || id.trim() === '') {
      throw new Error('O ID do método de pagamento é obrigatório');
    }

    const method = await this.paymentMethodRepository.getById(id);
    return method;
  }
}
