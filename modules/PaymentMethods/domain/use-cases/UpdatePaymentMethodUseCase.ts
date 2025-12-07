import { PaymentMethod, PaymentMethodRepository } from '../interfaces/IPaymentMethodRepository';

export class UpdatePaymentMethodUseCase {
  constructor(private paymentMethodRepository: PaymentMethodRepository) {}

  async execute(id: string, method: Partial<PaymentMethod>): Promise<PaymentMethod> {
    if (!id || id.trim() === '') {
      throw new Error('O ID do método de pagamento é obrigatório');
    }

    if (method.name !== undefined && method.name.trim() === '') {
      throw new Error('O nome do método de pagamento não pode ser vazio');
    }

    if (method.type !== undefined) {
      const validTypes = ['credit_card', 'debit_card', 'cash', 'pix', 'bank_transfer', 'other'];
      if (!validTypes.includes(method.type)) {
        throw new Error('Tipo de método de pagamento inválido');
      }
    }

    const updatedMethod = await this.paymentMethodRepository.update(id, method);
    return updatedMethod;
  }
}
