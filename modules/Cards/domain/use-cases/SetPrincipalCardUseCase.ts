import { ICardRepository } from "../interfaces/ICardRepository";

export class SetPrincipalCardUseCase {
  constructor(private cardRepository: ICardRepository) {}

  async execute(userId: string, cardId: string): Promise<void> {
    if (!userId || userId.trim() === '') {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!cardId || cardId.trim() === '') {
      throw new Error('ID do cartão é obrigatório');
    }

    await this.cardRepository.setPrincipalCard(userId, cardId);
  }
}
