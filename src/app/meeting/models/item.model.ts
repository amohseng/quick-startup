export enum ItemType  {
  Info = 'INFO',
  Action = 'ACTION'
}

export interface Item {
  id: string;
  description: string;
  type: ItemType;
  dueDate?: Date;
  responsibility?: string;
}
