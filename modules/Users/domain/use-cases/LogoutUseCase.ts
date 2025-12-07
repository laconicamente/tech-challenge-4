import { IUserRepository } from '../interfaces/IUserRepository';

export class LogoutUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<void> {
    await this.userRepository.logout();
  }
}
