import { auth, firestore } from '@/firebaseConfig';
import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
    IUserRepository,
    SignUpData,
    User,
    UserCredentials,
} from '../../domain/interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
  private readonly collectionName = 'users';

  private adaptUser(firebaseUser: FirebaseUser, additionalData?: any): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      phoneNumber: firebaseUser.phoneNumber || additionalData?.phoneNumber || null,
      createdAt: additionalData?.createdAt?.toDate?.() || undefined,
      updatedAt: additionalData?.updatedAt?.toDate?.() || undefined,
    };
  }

  async login(credentials: UserCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const userData = await this.getUserData(userCredential.user.uid);
      
      return this.adaptUser(userCredential.user, userData);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Email ou senha inválidos');
      }
      if (error.code === 'auth/user-not-found') {
        throw new Error('Usuário não encontrado');
      }
      if (error.code === 'auth/wrong-password') {
        throw new Error('Senha incorreta');
      }
      throw new Error('Erro ao fazer login');
    }
  }

  async signUp(data: SignUpData): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      await updateProfile(user, { displayName: data.name });

      await setDoc(
        doc(firestore, this.collectionName, user.uid),
        {
          uid: user.uid,
          name: data.name,
          email: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const userData = await this.getUserData(user.uid);

      return this.adaptUser(user, userData);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email já está em uso');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Senha muito fraca');
      }
      throw new Error('Erro ao criar conta');
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async updateUser(userId: string, data: Partial<User>): Promise<void> {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      if (currentUser.uid !== userId) {

        throw new Error('Não autorizado');
      }

      const authUpdateData: any = {};
      if (data.displayName !== undefined) {
        authUpdateData.displayName = data.displayName;
      }
      if (data.photoURL !== undefined) {
        authUpdateData.photoURL = data.photoURL;
      }

      if (Object.keys(authUpdateData).length > 0) {
        await updateProfile(currentUser, authUpdateData);
      }

      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      if (data.displayName !== undefined) {
        updateData.name = data.displayName;
      }

      await setDoc(doc(firestore, this.collectionName, userId), updateData, {
        merge: true,
      });
  }

  async getUserData(userId: string): Promise<User | null> {
      const userDocRef = doc(firestore, this.collectionName, userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: userId,
          email: data.email || null,
          displayName: data.name || data.displayName || null,
          photoURL: data.photoURL || null,
          phoneNumber: data.phoneNumber || null,
          createdAt: data.createdAt?.toDate?.() || undefined,
          updatedAt: data.updatedAt?.toDate?.() || undefined,
        };
      }

      return null;
  }

  getCurrentUser(): User | null {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    return this.adaptUser(currentUser);
  }

  async reloadUser(): Promise<void> {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.reload();
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await this.getUserData(firebaseUser.uid);
        callback(this.adaptUser(firebaseUser, userData));
      } else {
        callback(null);
      }
    });
  }
}
