export interface InvitationResponse {
  id: string;
  meetingId: string;
  email: string;
  response: boolean;
  responseDate: Date;
}
