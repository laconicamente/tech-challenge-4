import { Card, CardFilters, ICardRepository } from "../interfaces/  ICardRepository";

export class GetCardsUseCase {
  constructor(private cardRepository: ICardRepository) {}

  async execute(filters: CardFilters): Promise<Card[]> {
    if (!filters.userId || filters.userId.trim() === '') {
      throw new Error('userId é obrigatório para buscar cartões');
    }

    return await this.cardRepository.getCardsByUser(filters);
  }
}
