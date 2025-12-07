import { Card, ICardRepository } from "../interfaces/ICardRepository";

export class UpdateCardUseCase {
  constructor(private cardRepository: ICardRepository) {}

  async execute(id: string, card: Partial<Card>): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('ID do cartão é obrigatório');
    }

    await this.cardRepository.updateCard(id, card);
  }
}
