export enum ActionStatus  {
  Opened = 'OPENED',
  Ready = 'READY',
  Closed = 'CLOSED',
  Reopened = 'REOPENED'
}

export interface Action {
  id: string;
  topicId: string;
  meetingId: string;
  minutesRevision: number;
  companyId: string;
  companyEmail: string;
  description: string;
  actionBy: string;
  dueDate: Date;
  followupBy: string;
  status?: ActionStatus;
  statusComment?: string;
  lastUpdated: Date;
  lastUpdatedBy: string;
}
