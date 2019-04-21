import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MeetingService } from '../meeting.service';
import { UIService } from 'src/app/util/ui.service';
import { Meeting } from '../models/meeting.model';
import { DateService } from 'src/app/util/date.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-check-meeting-room-availability',
  templateUrl: './check-meeting-room-availability.component.html',
  styleUrls: ['./check-meeting-room-availability.component.css']
})
export class CheckMeetingRoomAvailabilityComponent implements OnInit, OnDestroy {
  isLoading = false;
  calendarDate: Date;
  meetingRoomId = '';
  meetings: Meeting[] = [];
  invitationResponseMap: Map<string, string>;
  meetingsSubscription: Subscription;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private meetingService: MeetingService,
  private uiService: UIService, private ds: DateService) { }

  ngOnInit() {
    this.calendarDate = new Date(this.data.calendarDate);
    this.meetingRoomId = this.data.meetingRoomId;
    this.getDayMeetings();
  }

  getDayMeetings() {
    this.isLoading = true;
    const from: Date = this.ds.getStartOfDayDate(this.calendarDate);
    const to: Date = this.ds.getEndOfDayDate(this.calendarDate);
    if (this.meetingsSubscription) {
      this.meetingsSubscription.unsubscribe();
    }
    this.meetingsSubscription = this.meetingService
    .getMeetingsByMeetingRoomId(this.meetingRoomId, from, to)
    .subscribe(meetings => {
        this.meetings = meetings;
        this.initInvitationResponses();
        this.isLoading = false;
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
    });
  }

  initInvitationResponses() {
    this.invitationResponseMap = new Map<string, string>();
    for (const meeting of this.meetings) {
      this.invitationResponseMap.set(meeting.id, 'ACCEPTED');
    }
  }

  ngOnDestroy() {
    if (this.meetingsSubscription) {
      this.meetingsSubscription.unsubscribe();
    }
  }
}
