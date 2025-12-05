import { Timestamp } from "firebase/firestore";

export const parseDateString = (input?: string): Date | undefined => {
  if (!input) return undefined;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
    const [d, m, y] = input.split("/").map(Number);
    const dt = new Date(y, (m ?? 1) - 1, d);
    return isNaN(dt.getTime()) ? undefined : dt;
  }
  const dt = new Date(input);
  return isNaN(dt.getTime()) ? undefined : dt;
}

export const toDateFromFirestore = (raw: any): Date | undefined => {
  if (!raw) return undefined;
  
  if (raw instanceof Timestamp) return raw.toDate();
  
  if (raw instanceof Date) return raw;
  
  if (
    typeof raw === "object" &&
    typeof raw.seconds === "number" &&
    typeof raw.nanoseconds === "number"
  ) {    
    return new Date(
      raw.seconds * 1000 + Math.floor(raw.nanoseconds / 1_000_000)
    );
  }
  
  if (typeof raw === "string") {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return d;
    }
  }
  
  return undefined;
};

export const formatDateISO = (d: Date | null) => (d ? d.toISOString() : "");
export const formatDate = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString("pt-BR") : "";
