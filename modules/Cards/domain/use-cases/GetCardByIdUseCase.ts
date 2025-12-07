import { Card, ICardRepository } from "../interfaces/ICardRepository";

export class GetCardByIdUseCase {
  constructor(private cardRepository: ICardRepository) {}

  async execute(id: string): Promise<Card | null> {
    if (!id || id.trim() === '') {
      throw new Error('ID do cartão é obrigatório');
    }

    return await this.cardRepository.getCardById(id);
  }
}
