import { AddCardUseCase, DeleteCardUseCase, GetCardByIdUseCase, GetCardsUseCase, SetPrincipalCardUseCase, UpdateCardUseCase } from '../../domain/use-cases';
import { CardRepository } from '../repositories/CardRepository';

const cardRepository = new CardRepository();

export const getCardsUseCase = new GetCardsUseCase(cardRepository);
export const getCardByIdUseCase = new GetCardByIdUseCase(cardRepository);
export const addCardUseCase = new AddCardUseCase(cardRepository);
export const updateCardUseCase = new UpdateCardUseCase(cardRepository);
export const deleteCardUseCase = new DeleteCardUseCase(cardRepository);
export const setPrincipalCardUseCase = new SetPrincipalCardUseCase(cardRepository);
