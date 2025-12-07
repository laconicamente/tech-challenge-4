import { CardEntity } from "../entities";
import { Card, ICardRepository } from "../interfaces/ICardRepository";

export class AddCardUseCase {
  constructor(private cardRepository: ICardRepository) {}

  async execute(card: Omit<Card, 'id'>): Promise<string> {
    const entity = new CardEntity({
      userId: card.userId,
      number: card.number,
      name: card.name,
      cvv: card.cvv,
      expiredAt: card.expiredAt,
      type: card.type,
      flag: card.flag,
      blocked: card.blocked || false,
      principal: card.principal || false,
      createdAt: card.createdAt,
    }).toJSON();

    const cardId = await this.cardRepository.addCard(entity);
    
    return cardId;
  }
}
