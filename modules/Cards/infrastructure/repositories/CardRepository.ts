import { firestore } from "@/firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  QueryFieldFilterConstraint,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { Card, CardFilters, ICardRepository } from "../../domain/interfaces/ICardRepository";

export class CardRepository implements ICardRepository {
  private readonly collectionName = "cards";

  /**
   * Remove campos undefined de um objeto para evitar erros do Firestore
   */
  private cleanCardFields(obj: Record<string, any>): Record<string, any> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Busca cartões de um usuário com filtros
   */
  async getCardsByUser(filters: CardFilters): Promise<Card[]> {
    const { userId, type, blocked, principal } = filters;

    const constraints: QueryFieldFilterConstraint[] = [
      where("userId", "==", userId.trim()),
    ];

    if (type) constraints.push(where("type", "==", type));
    if (blocked !== undefined) constraints.push(where("blocked", "==", blocked));
    if (principal !== undefined) constraints.push(where("principal", "==", principal));

    const qRef = query(
      collection(firestore, this.collectionName),
      ...constraints,
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(qRef);

    const cards: Card[] = snap.docs.map((doc) => {
      const data = doc.data();
      const createdAtDate = data.createdAt?.toDate() || new Date();

      return {
        id: doc.id,
        userId: data.userId,
        number: data.number,
        name: data.name,
        cvv: Number(data.cvv),
        expiredAt: data.expiredAt,
        type: data.type,
        flag: data.flag,
        blocked: data.blocked || false,
        principal: data.principal || false,
        createdAt: createdAtDate,
      };
    });

    return cards;
  }

  /**
   * Busca um cartão por ID
   */
  async getCardById(id: string): Promise<Card | null> {
    const docRef = doc(firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    const createdAtDate = data.createdAt?.toDate() || new Date();

    return {
      id: docSnap.id,
      userId: data.userId,
      number: data.number,
      name: data.name,
      cvv: Number(data.cvv),
      expiredAt: data.expiredAt,
      type: data.type,
      flag: data.flag,
      blocked: data.blocked || false,
      principal: data.principal || false,
      createdAt: createdAtDate,
    };
  }

  /**
   * Adiciona um novo cartão
   */
  async addCard(card: Omit<Card, "id">): Promise<string> {
    try {
      const cardData = this.cleanCardFields({
        ...card,
        createdAt: card.createdAt || Timestamp.now(),
      });

      const docRef = await addDoc(
        collection(firestore, this.collectionName),
        cardData
      );

      return docRef.id;
    } catch (error) {
      throw new Error(
        `Falha ao adicionar cartão: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }

  /**
   * Atualiza um cartão existente
   */
  async updateCard(id: string, card: Partial<Card>): Promise<void> {
    const docRef = doc(firestore, this.collectionName, id);
    const cardData = this.cleanCardFields(card);
    await updateDoc(docRef, cardData);
  }

  /**
   * Deleta um cartão
   */
  async deleteCard(id: string): Promise<void> {
    const docRef = doc(firestore, this.collectionName, id);
    await deleteDoc(docRef);
  }

  /**
   * Define um cartão como principal e remove a flag dos outros
   */
  async setPrincipalCard(userId: string, cardId: string): Promise<void> {
    const batch = writeBatch(firestore);

    const cardsQuery = query(
      collection(firestore, this.collectionName),
      where("userId", "==", userId)
    );
    const cardsSnap = await getDocs(cardsQuery);

    cardsSnap.docs.forEach((cardDoc) => {
      const docRef = doc(firestore, this.collectionName, cardDoc.id);
      batch.update(docRef, { principal: false });
    });

    const selectedCardRef = doc(firestore, this.collectionName, cardId);
    batch.update(selectedCardRef, { principal: true });

    await batch.commit();
  }
}
