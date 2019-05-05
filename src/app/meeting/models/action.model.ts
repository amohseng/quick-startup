export enum ActionStatus  {
  Opened = 'OPENED',
  Ready = 'READY',
  Closed = 'CLOSED'
}

export enum ActionFilterType  {
  CompanyId = 'COMPANYID',
  ActionBy = 'ACTIONBY',
  FollowupBy = 'FOLLOWUPBY'
}

export interface ActionFilter {
  filterType?: ActionFilterType;
  companyId?: string;
  actionBy?: string;
  followupBy?: string;
  from?: Date;
  to?: Date;
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
