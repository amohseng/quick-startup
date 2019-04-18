import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Meeting } from '../models/meeting.model';
import { MeetingService } from '../meeting.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UIService } from 'src/app/util/ui.service';
import { DateService } from 'src/app/util/date.service';

import { Attendee } from '../models/attendee.model';
import { CalendarView } from '../calendar/calendar-header/calendar-header.component';

@Component({
  selector: 'app-view-calendar',
  templateUrl: './view-calendar.component.html',
  styleUrls: ['./view-calendar.component.css']
})
export class ViewCalendarComponent implements OnInit, OnDestroy {
  isLoading = false;
  email = '';
  calendarDate: Date = new Date();
  currentView: CalendarView;
  calendarView = CalendarView;
  meetings: Meeting[] = [];
  attendeeResponseMap: Map<string, string>;

  meetingsSubscription: Subscription;
  attendeesSubscription: Subscription;

  constructor(private meetingService: MeetingService, private authService: AuthService,
              private uiService: UIService, private router: Router, private route: ActivatedRoute, private ds: DateService) { }

  ngOnInit() {
    this.isLoading = true;
    this.email = this.authService.getEmail();
    this.currentView = CalendarView.Week;
    this.getMeetings();
  }

  viewMeeting(meeting: Meeting) {
    this.router.navigate([`../${meeting.id}`], {relativeTo: this.route});
  }

  createNewMeeting(data) {
    let meetingDate: Date = null;
    let startTime: number = null;
    let endTime: number = null;
    if (data) {
      meetingDate = data.meetingDate;
      startTime = data.startTime;
      endTime = data.endTime;
    }
    this.router.navigate(['../new'],
    {relativeTo: this.route, queryParams: {'meetingDate': meetingDate, 'startTime': startTime, 'endTime': endTime}});
  }

  changeCalendarDate(anydate: Date) {
    this.calendarDate = new Date(anydate);
    this.getMeetings();
  }

  setCalendarView(view) {
    this.currentView = view;
    this.getMeetings();
  }

  getMeetings() {
    if (this.currentView === CalendarView.Day) {
      this.getDayMeetings();
    } else if (this.currentView === CalendarView.Week) {
      this.getWeekMeetings();
    }
  }

  getWeekMeetings() {
    this.isLoading = true;
    const from: Date = this.ds.getDayOfWeekDate(this.calendarDate, 0);
    const to: Date = this.ds.getEndOfDayDate(this.ds.getDayOfWeekDate(this.calendarDate, 6));
    if (this.meetingsSubscription) {
      this.meetingsSubscription.unsubscribe();
    }
    this.meetingsSubscription = this.meetingService
    .getMeetingsByAttendeeEmail(this.email, from, to)
    .subscribe(meetings => {
        this.meetings = meetings;
        this.initAttendeeResponses();
        if (this.meetings.length > 0) {
          this.getAttendeeResponses();
        } else {
          this.isLoading = false;
        }
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
      this.router.navigate(['/']);
    });
  }

  getDayMeetings() {
    this.isLoading = true;
    const from: Date = this.ds.getStartOfDayDate(this.calendarDate);
    const to: Date = this.ds.getEndOfDayDate(this.calendarDate);
    if (this.meetingsSubscription) {
      this.meetingsSubscription.unsubscribe();
    }
    this.meetingsSubscription = this.meetingService
    .getMeetingsByAttendeeEmail(this.email, from, to)
    .subscribe(meetings => {
        this.meetings = meetings;
        this.initAttendeeResponses();
        if (this.meetings.length > 0) {
          this.getAttendeeResponses();
        } else {
          this.isLoading = false;
        }
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
      this.router.navigate(['/']);
    });
  }

  initAttendeeResponses() {
    this.attendeeResponseMap = new Map<string, string>();
    this.meetings.forEach(meeting => {
      this.attendeeResponseMap.set(meeting.id, (meeting.organizer === this.email ? 'ACCEPTED' : 'PENDING'));
    });
  }
  getAttendeeResponses() {
    let counter = 0;
    if (this.attendeesSubscription) {
      this.attendeesSubscription.unsubscribe();
    }
    this.attendeesSubscription = this.meetingService
      .getAttendeeForEachMeeting(this.meetings.map(meeting => meeting.id), this.email)
      .subscribe((data: Attendee[]) => {
        counter++;
        if (data.length > 0) {
          this.attendeeResponseMap
              .set(data[0].meetingId, data[0].response ? 'ACCEPTED' : 'DECLINED');
        }
        if (counter === this.meetings.length) {
          this.isLoading = false;
        }
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
      this.router.navigate(['/']);
    });
  }

  getMeetingById(meetingId: string): Meeting {
    return this.meetings.find((meeting => {
      return meeting.id === meetingId;
    }));
  }

  ngOnDestroy() {
    if (this.meetingsSubscription) {
      this.meetingsSubscription.unsubscribe();
    }
    if (this.attendeesSubscription) {
      this.attendeesSubscription.unsubscribe();
    }
  }
}
