import { IUserRepository, User } from '../interfaces/IUserRepository';

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, data: Partial<User>): Promise<void> {
    if (!userId || userId.trim() === '') {
      throw new Error('ID do usuário é obrigatório');
    }

    const currentUser = await this.userRepository.getUserData(userId);
    if (!currentUser) {
      throw new Error('Usuário não encontrado');
    }

    const updatedData: User = {
      ...currentUser,
      ...data,
    };

    await this.userRepository.updateUser(userId, updatedData);
    await this.userRepository.reloadUser();
  }
}
