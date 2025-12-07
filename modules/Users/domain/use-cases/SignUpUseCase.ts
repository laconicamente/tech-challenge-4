import { UserEntity } from '../entities';
import { IUserRepository, SignUpData, User } from '../interfaces/IUserRepository';

export class SignUpUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: SignUpData): Promise<User> {
    if (!data.password || data.password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    const userEntity = new UserEntity({
      uid: '',
      email: data.email,
      displayName: data.name,
    });

    const user = await this.userRepository.signUp(data);
    
    return user;
  }
}
