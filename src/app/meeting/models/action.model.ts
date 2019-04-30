export enum ActionStatus  {
  Opened = 'OPENED',
  Closed = 'CLOSED',
  Reopened = 'REOPENED'
}

export interface Action {
  id: string;
  topicId: string;
  meetingId: string;
  companyId: string;
  companyEmail: string;
  description: string;
  actionBy: string;
  dueDate: Date;
  status: ActionStatus;
  statusLastUpdated: Date;
  statusLastUpdatedBy: string;
}
