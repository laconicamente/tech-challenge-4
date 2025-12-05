import { Transaction, TransactionType } from "../interfaces/ITransactionRepository";

export class TransactionEntity {
  public readonly id?: string;
  public readonly userId: string;
  public readonly type: TransactionType;
  public readonly value: number;
  public readonly categoryId: string;
  public readonly methodId: string;
  public readonly description?: string;
  public readonly createdAt: Date;
  public readonly fileUrl?: string;

  constructor(data: Transaction) {
    this.validate(data);
    
    this.id = data.id;
    this.userId = data.userId || '';
    this.type = data.type;
    this.value = data.value;
    this.categoryId = data.categoryId;
    this.methodId = data.methodId;
    this.description = data.description;
    this.createdAt = data.createdAt || new Date();
    this.fileUrl = data.fileUrl;
  }

  private validate(data: Transaction): void {
    if (!data.userId || data.userId.trim() === '') {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!data.categoryId || data.categoryId.trim() === '') {
      throw new Error('Categoria é obrigatória');
    }

    if (!data.methodId || data.methodId.trim() === '') {
      throw new Error('Método de pagamento é obrigatório');
    }

    if (!data.value || data.value <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }

    if (!['income', 'expense'].includes(data.type)) {
      throw new Error('Tipo de transação inválido');
    }

    if (data.description && data.description.length > 200) {
      throw new Error('Descrição não pode ter mais de 200 caracteres');
    }
  }

  isExpense(): boolean {
    return this.type === 'expense';
  }

  isIncome(): boolean {
    return this.type === 'income';
  }

  create(): Transaction {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      value: this.value,
      categoryId: this.categoryId,
      methodId: this.methodId,
      description: this.description,
      createdAt: this.createdAt,
      fileUrl: this.fileUrl,
    };
  }
}
