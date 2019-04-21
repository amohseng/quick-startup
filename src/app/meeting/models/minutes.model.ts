import { Topic } from './topic.model';

export interface Minutes {
  id: string;
  meetingId: string;
  companyId: string;
  companyEmail: string;
  topics: Topic[];
  attendance: string[];
  lastUpdated: Date;
  lastUpdatedBy: string;
}
