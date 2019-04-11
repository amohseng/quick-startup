import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Meeting } from '../models/meeting.model';
import { MeetingService } from '../meeting.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UIService } from 'src/app/util/ui.service';

@Component({
  selector: 'app-view-calendar',
  templateUrl: './view-calendar.component.html',
  styleUrls: ['./view-calendar.component.css']
})
export class ViewCalendarComponent implements OnInit, OnDestroy {
  isLoading = false;
  email = '';
  calendarDate: Date = new Date();
  meetings: Meeting[] = [];

  meetingsSubscription: Subscription;

  constructor(private meetingService: MeetingService, private authService: AuthService,
              private uiService: UIService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading = true;
    this.email = this.authService.getEmail();
  }

  viewMeeting(meeting: Meeting) {
    console.log(meeting);
    this.router.navigate([`../${meeting.id}`], {relativeTo: this.route});
  }

  createNewMeeting() {
    this.router.navigate(['../new'], {relativeTo: this.route});
  }

  changeCalendarDate(anydate: Date) {
    this.calendarDate = new Date(anydate);
    this.getMeetings();
  }

  getMeetings() {
    this.isLoading = true;
    const from: Date = this.getDayOfWeekDate(this.calendarDate, 0);
    const to: Date = this.getEndOfDayDate(this.getDayOfWeekDate(this.calendarDate, 6));
    if (this.meetingsSubscription) {
      this.meetingsSubscription.unsubscribe();
    }
    this.meetingsSubscription = this.meetingService
    .getMeetingsByAttendeeEmail(this.email, from, to)
    .subscribe(meetings => {
        this.meetings = meetings;
        this.isLoading = false;
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
      this.router.navigate(['/']);
    });
  }

  getDayOfWeekDate(anydate: Date, weekdayNumber: number) {
    const weekdayDate = new Date(anydate);
    weekdayDate.setDate(weekdayDate.getDate() - weekdayDate.getDay() + weekdayNumber);
    weekdayDate.setHours(0);
    weekdayDate.setMinutes(0);
    weekdayDate.setSeconds(0);
    return weekdayDate;
  }

  getEndOfDayDate(anydate: Date) {
    const endofdayDate = new Date(anydate);
    endofdayDate.setHours(23);
    endofdayDate.setMinutes(59);
    endofdayDate.setSeconds(59);
    return endofdayDate;
  }

  ngOnDestroy() {
    if (this.meetingsSubscription) {
      this.meetingsSubscription.unsubscribe();
    }
  }
}
