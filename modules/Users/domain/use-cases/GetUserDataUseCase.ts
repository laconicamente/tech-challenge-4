import { UserEntity } from '../entities';
import { IUserRepository, User } from '../interfaces/IUserRepository';

export class GetUserDataUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User | null> {
    if (!userId || userId.trim() === '') {
      throw new Error('ID do usuário é obrigatório');
    }

    const user = await this.userRepository.getUserData(userId);
    
    if (!user) {
      return null;
    }

    const userEntity = new UserEntity(user);
    
    return userEntity.create();
  }
}
