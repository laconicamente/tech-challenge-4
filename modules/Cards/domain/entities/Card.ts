import { BankCardFlag, BankCardType } from "../../domain/interfaces/IBankCard";
import { Card } from "../interfaces/ICardRepository";

export class CardEntity {
  public readonly id?: string;
  public readonly userId: string;
  public readonly number: string;
  public readonly name: string;
  public readonly cvv: number;
  public readonly expiredAt: string;
  public readonly type: BankCardType;
  public readonly flag: BankCardFlag;
  public readonly blocked: boolean;
  public readonly principal: boolean;
  public readonly createdAt?: Date;

  constructor(data: Card) {
    this.validate(data);
    
    this.id = data.id;
    this.userId = data.userId;
    this.number = data.number;
    this.name = data.name;
    this.cvv = data.cvv;
    this.expiredAt = data.expiredAt;
    this.type = data.type;
    this.flag = data.flag;
    this.blocked = data.blocked || false;
    this.principal = data.principal || false;
    this.createdAt = data.createdAt || new Date();
  }

  private validate(data: Card): void {
    if (!data.userId || data.userId.trim() === '') {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!data.number || data.number.trim() === '') {
      throw new Error('Número do cartão é obrigatório');
    }

    if (!data.name || data.name.trim() === '') {
      throw new Error('Nome do cartão é obrigatório');
    }

    if (!data.cvv || data.cvv < 100 || data.cvv > 9999) {
      throw new Error('CVV inválido');
    }

    if (!data.expiredAt || !this.isValidExpiry(data.expiredAt)) {
      throw new Error('Data de expiração inválida');
    }

    if (!data.type || data.type.trim() === '') {
      throw new Error('Tipo do cartão é obrigatório');
    }

    if (!Object.values(BankCardFlag).includes(data.flag)) {
      throw new Error('Bandeira do cartão inválida');
    }
  }

  private isValidExpiry(expiry: string): boolean {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(expiry)) return false;

    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expiryYear = parseInt(year, 10);
    const expiryMonth = parseInt(month, 10);

    if (expiryYear < currentYear) return false;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false;

    return true;
  }

  isExpired(): boolean {
    return !this.isValidExpiry(this.expiredAt);
  }

  isBlocked(): boolean {
    return this.blocked;
  }

  isPrincipal(): boolean {
    return this.principal;
  }

  toJSON(): Card {
    return {
      id: this.id,
      userId: this.userId,
      number: this.number,
      name: this.name,
      cvv: this.cvv,
      expiredAt: this.expiredAt,
      type: this.type,
      flag: this.flag,
      blocked: this.blocked,
      principal: this.principal,
      createdAt: this.createdAt,
    };
  }
}
