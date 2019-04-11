export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  whiteboard: boolean;
  screen: boolean;
  loudSpeakers: boolean;
  microphones: boolean;
  locationId: string;
  companyId: string;
  companyEmail: string;
}
