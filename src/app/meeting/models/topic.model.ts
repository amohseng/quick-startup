import { Item } from './item.model';

export interface Topic {
  id: string;
  topicNumber: number;
  description: string;
  items: Item[];
}
