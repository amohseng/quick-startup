export enum ActionStatus  {
  Any = 'Any',
  Opened = 'Opened',
  Ready = 'Ready',
  Closed = 'Closed'
}

export enum ActionFilterType  {
  CompanyId = 'CompanyId',
  ActionBy = 'ActionBy',
  FollowupBy = 'FollowupBy'
}

export interface ActionFilter {
  filterType?: ActionFilterType;
  status?: ActionStatus;
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
