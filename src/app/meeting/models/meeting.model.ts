import { MeetingRoom } from 'src/app/company/models/meeting-room.model';
import { Location } from 'src/app/company/models/location.model';

export interface Meeting {
  id: string;
  organizer: string;
  subject: string;
  companyId: string;
  companyEmail: string;
  meetingRoom: MeetingRoom;
  location: Location;
  start: Date;
  end: Date;
  invitations: string[];
  scribes: string[];
  canceled: boolean;
  lastUpdated: Date;
  parentConflicts?: Meeting[];
  childConflicts?: Meeting[];
}
