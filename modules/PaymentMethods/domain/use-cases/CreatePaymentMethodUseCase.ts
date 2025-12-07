import { PaymentMethod, PaymentMethodRepository } from '../interfaces/IPaymentMethodRepository';

export class CreatePaymentMethodUseCase {
  constructor(private paymentMethodRepository: PaymentMethodRepository) {}

  async execute(method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod> {
    if (!method.name || method.name.trim() === '') {
      throw new Error('O nome do método de pagamento é obrigatório');
    }

    if (!method.type) {
      throw new Error('O tipo do método de pagamento é obrigatório');
    }

    const validTypes = ['credit_card', 'debit_card', 'cash', 'pix', 'bank_transfer', 'other'];
    if (!validTypes.includes(method.type)) {
      throw new Error('Tipo de método de pagamento inválido');
    }

    const newMethod = await this.paymentMethodRepository.create(method);
    return newMethod;
  }
}
