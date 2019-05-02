import { Topic } from './topic.model';

export interface Minutes {
  id: string; // should be the same as meeting id
  revision: number;
  companyId: string;
  companyEmail: string;
  topics: Topic[];
  attendance: string[];
  lastUpdated: Date;
  lastUpdatedBy: string;
}
