export interface Attendee {
  id: string;
  meetingId: string;
  email: string;
  displayName: string;
  photoURL: string;
  response: boolean;
  responseDate: Date;
  attendance: boolean;
  attendanceDate: Date;
}
