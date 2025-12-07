import {
    GetUserDataUseCase,
    LoginUseCase,
    LogoutUseCase,
    SignUpUseCase,
    UpdateUserUseCase,
} from '../../domain/use-cases';
import { UserRepository } from '../repositories/UserRepository';

const userRepository = new UserRepository();

export const loginUseCase = new LoginUseCase(userRepository);
export const signUpUseCase = new SignUpUseCase(userRepository);
export const logoutUseCase = new LogoutUseCase(userRepository);
export const updateUserUseCase = new UpdateUserUseCase(userRepository);
export const getUserDataUseCase = new GetUserDataUseCase(userRepository);
