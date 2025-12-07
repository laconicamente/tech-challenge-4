import { ICardRepository } from "../interfaces/ICardRepository";

export class DeleteCardUseCase {
  constructor(private cardRepository: ICardRepository) {}

  async execute(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('ID do cartão é obrigatório');
    }

    await this.cardRepository.deleteCard(id);
  }
}
