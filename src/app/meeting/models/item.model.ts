import { Comment } from './comment.model';

export enum ItemType  {
  Info = 'INFO',
  Action = 'ACTION'
}

export enum ItemStatus {
  Opened = 'OPENED',
  Closed = 'CLOSED'
}

export interface Item {
  id: string;
  topicId: string;
  meetingId: string;
  companyId: string;
  companyEmail: string;
  itemNumber: number;
  description: string;
  type: ItemType;
  status?: ItemStatus;
  dueDate?: Date;
  responsibility?: string;
  comments?: Comment[];
  lastUpdated: Date;
  lastUpdatedBy: string;
}
