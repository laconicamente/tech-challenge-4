import { PaymentMethodRepository } from '../interfaces/IPaymentMethodRepository';

export class DeletePaymentMethodUseCase {
  constructor(private paymentMethodRepository: PaymentMethodRepository) {}

  async execute(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('O ID do método de pagamento é obrigatório');
    }

    await this.paymentMethodRepository.delete(id);
  }
}
