export interface Attendee {
  id: string;
  meetingId: string;
  email: string;
  response: boolean;
  responseDate: Date;
  attendance: boolean;
  attendanceDate: Date;
}
