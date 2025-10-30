
export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  score: number;
  lastMessageAt: Date;
  addedBy: string;
  avatar: string;
}

export type SortDirection = 'ascending' | 'descending';

export interface SortConfig {
  key: keyof Customer;
  direction: SortDirection;
}
