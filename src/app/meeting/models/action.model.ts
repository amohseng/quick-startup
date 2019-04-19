export enum ActionStatus  {
  Opened = 'OPENED',
  Closed = 'CLOSED',
  Reopened = 'REOPENED'
}

export interface Action {
  id: string;
  itemId: string;
  topicId: string;
  meetingId: string;
  companyId: string;
  companyEmail: string;
  description: string;
  dueDate: Date;
  responsibilty: string;
  status: ActionStatus;
  statusLastUpdated: Date;
  statusLastUpdatedBy: string;
}
