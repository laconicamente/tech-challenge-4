import { User } from '../interfaces/IUserRepository';

export class UserEntity {
  public readonly uid: string;
  public readonly email: string | null;
  public readonly displayName: string | null;
  public readonly photoURL?: string | null;
  public readonly phoneNumber?: string | null;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(data: User) {
    this.validate(data);
    
    this.uid = data.uid;
    this.email = data.email;
    this.displayName = data.displayName;
    this.photoURL = data.photoURL;
    this.phoneNumber = data.phoneNumber;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  private validate(data: User): void {
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Email inválido');
    }

    if (data.displayName && data.displayName.length < 2) {
      throw new Error('Nome deve ter no mínimo 2 caracteres');
    }

    if (data.displayName && data.displayName.length > 100) {
      throw new Error('Nome não pode ter mais de 100 caracteres');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  hasEmail(): boolean {
    return this.email !== null && this.email !== '';
  }

  hasDisplayName(): boolean {
    return this.displayName !== null && this.displayName !== '';
  }

  create(): User {
    return {
      uid: this.uid,
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      phoneNumber: this.phoneNumber,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
