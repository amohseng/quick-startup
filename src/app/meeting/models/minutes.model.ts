import { Topic } from './topic.model';

export interface Minutes {
  id: string;
  meetingId: string;
  companyId: string;
  companyEmail: string;
  topics: Topic[];
  lastUpdated: Date;
  lastUpdatedBy: string;
}
