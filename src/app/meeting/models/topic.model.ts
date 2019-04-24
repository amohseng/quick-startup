import { Item } from './item.model';

export interface Topic {
  id: string;
  description: string;
  items: Item[];
}
