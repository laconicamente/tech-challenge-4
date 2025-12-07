export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends UserCredentials {
  name: string;
}

export interface IUserRepository {
  login(credentials: UserCredentials): Promise<User>;
  signUp(data: SignUpData): Promise<User>;
  logout(): Promise<void>;
  updateUser(userId: string, data: Partial<User>): Promise<void>;
  getUserData(userId: string): Promise<User | null>;
  getCurrentUser(): User | null;
  reloadUser(): Promise<void>;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
