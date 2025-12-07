import { BankCardProps } from "./IBankCard";

export interface Card extends Omit<BankCardProps, 'createdAt'> {
  id?: string;
  userId: string;
  createdAt?: Date;
}

export interface CardFilters {
  userId: string;
  type?: string;
  blocked?: boolean;
  principal?: boolean;
}

export interface ICardRepository {
  /**
   * Busca todos os cartões de um usuário
   * @param filters - Filtros incluindo userId obrigatório
   * @returns Promise com array de cartões
   */
  getCardsByUser(filters: CardFilters): Promise<Card[]>;

  /**
   * Busca um cartão por ID
   * @param id - ID do cartão
   * @returns Promise com o cartão ou null
   */
  getCardById(id: string): Promise<Card | null>;

  /**
   * Adiciona um novo cartão
   * @param card - Dados do cartão
   * @returns Promise com o ID do cartão criado
   */
  addCard(card: Omit<Card, 'id'>): Promise<string>;

  /**
   * Atualiza um cartão existente
   * @param id - ID do cartão
   * @param card - Dados parciais para atualizar
   * @returns Promise void
   */
  updateCard(id: string, card: Partial<Card>): Promise<void>;

  /**
   * Deleta um cartão
   * @param id - ID do cartão
   * @returns Promise void
   */
  deleteCard(id: string): Promise<void>;

  /**
   * Define um cartão como principal
   * @param userId - ID do usuário
   * @param cardId - ID do cartão a ser definido como principal
   * @returns Promise void
   */
  setPrincipalCard(userId: string, cardId: string): Promise<void>;
}
