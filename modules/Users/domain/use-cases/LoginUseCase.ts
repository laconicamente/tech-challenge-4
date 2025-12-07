import { IUserRepository, User, UserCredentials } from '../interfaces/IUserRepository';

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(credentials: UserCredentials): Promise<User> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email e senha são obrigatórios');
    }

    if (credentials.password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    const user = await this.userRepository.login(credentials);
    
    return user;
  }
}
