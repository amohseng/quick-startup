export interface Comment {
  id: string;
  itemId: string;
  topicId: string;
  meetingId: string;
  companyId: string;
  companyEmail: string;
  minutesRevision: number;
  description: string;
  lastUpdated: Date;
  lastUpdatedBy: string;
}
