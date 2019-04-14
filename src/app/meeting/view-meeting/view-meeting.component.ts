import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { MeetingService } from '../meeting.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UIService } from 'src/app/util/ui.service';
import { Meeting } from '../models/meeting.model';
import { Attendee } from '../models/attendee.model';
import { ProfileData } from 'src/app/auth/models/profile-data.model';


@Component({
  selector: 'app-view-meeting',
  templateUrl: './view-meeting.component.html',
  styleUrls: ['./view-meeting.component.css']
})
export class ViewMeetingComponent implements OnInit, OnDestroy {
  readonly hours = [
    {value: 0, text: '12:00 AM', hours: 0, minutes: 0},
    {value: 0.5, text: '12:30 AM', hours: 0, minutes: 30},
    {value: 1, text: '01:00 AM', hours: 1, minutes: 0},
    {value: 1.5, text: '01:30 AM', hours: 1, minutes: 30},
    {value: 2, text: '02:00 AM', hours: 2, minutes: 0},
    {value: 2.5, text: '02:30 AM', hours: 2, minutes: 30},
    {value: 3, text: '03:00 AM', hours: 3, minutes: 0},
    {value: 3.5, text: '03:30 AM', hours: 3, minutes: 30},
    {value: 4, text: '04:00 AM', hours: 4, minutes: 0},
    {value: 4.5, text: '04:30 AM', hours: 4, minutes: 30},
    {value: 5, text: '05:00 AM', hours: 5, minutes: 0},
    {value: 5.5, text: '05:30 AM', hours: 5, minutes: 30},
    {value: 6, text: '06:00 AM', hours: 6, minutes: 0},
    {value: 6.5, text: '06:30 AM', hours: 6, minutes: 30},
    {value: 7, text: '07:00 AM', hours: 7, minutes: 0},
    {value: 7.5, text: '07:30 AM', hours: 7, minutes: 30},
    {value: 8, text: '08:00 AM', hours: 8, minutes: 0},
    {value: 8.5, text: '08:30 AM', hours: 8, minutes: 30},
    {value: 9, text: '09:00 AM', hours: 9, minutes: 0},
    {value: 9.5, text: '09:30 AM', hours: 9, minutes: 30},
    {value: 10, text: '10:00 AM', hours: 10, minutes: 0},
    {value: 10.5, text: '10:30 AM', hours: 10, minutes: 30},
    {value: 11, text: '11:00 AM', hours: 11, minutes: 0},
    {value: 11.5, text: '11:30 AM', hours: 11, minutes: 30},
    {value: 12, text: '12:00 PM', hours: 12, minutes: 0},
    {value: 12.5, text: '12:30 PM', hours: 12, minutes: 30},
    {value: 13, text: '01:00 PM', hours: 13, minutes: 0},
    {value: 13.5, text: '01:30 PM', hours: 13, minutes: 30},
    {value: 14, text: '02:00 PM', hours: 14, minutes: 0},
    {value: 14.5, text: '02:30 PM', hours: 14, minutes: 30},
    {value: 15, text: '03:00 PM', hours: 15, minutes: 0},
    {value: 15.5, text: '03:30 PM', hours: 15, minutes: 30},
    {value: 16, text: '04:00 PM', hours: 16, minutes: 0},
    {value: 16.5, text: '04:30 PM', hours: 16, minutes: 30},
    {value: 17, text: '05:00 PM', hours: 17, minutes: 0},
    {value: 17.5, text: '05:30 PM', hours: 17, minutes: 30},
    {value: 18, text: '06:00 PM', hours: 18, minutes: 0},
    {value: 18.5, text: '06:30 PM', hours: 18, minutes: 30},
    {value: 19, text: '07:00 PM', hours: 19, minutes: 0},
    {value: 19.5, text: '07:30 PM', hours: 19, minutes: 30},
    {value: 20, text: '08:00 PM', hours: 20, minutes: 0},
    {value: 20.5, text: '08:30 PM', hours: 20, minutes: 30},
    {value: 21, text: '09:00 PM', hours: 21, minutes: 0},
    {value: 21.5, text: '09:30 PM', hours: 21, minutes: 30},
    {value: 22, text: '10:00 PM', hours: 22, minutes: 0},
    {value: 22.5, text: '10:30 PM', hours: 22, minutes: 30},
    {value: 23, text: '11:00 PM', hours: 23, minutes: 0},
    {value: 23.5, text: '11:30 PM', hours: 23, minutes: 30}
  ];

  meetingId = '';
  selectedLocationUrl = '';
  isLoading = false;
  isOrganizer = false;

  email = '';
  profileDate: ProfileData;
  meeting: Meeting;
  attendees: Attendee[];

  totalResourcesToFetch = 2;
  fetchedResources = 0;
  meetingSubscription: Subscription;
  attendeesSubscription: Subscription;

  constructor(private meetingService: MeetingService, private authService: AuthService, private uiService: UIService,
              private router: Router, private route: ActivatedRoute) { }

    ngOnInit() {
      this.isLoading = true;
      this.email = this.authService.getEmail();
      this.profileDate = this.authService.getProfile();
      this.route.params.subscribe((params: Params) => {
        this.meetingId = params['id'];
        this.getMeeting();
        this.getAttendees();
      });
    }

    getMeeting() {
      if (this.meetingSubscription) {
        this.meetingSubscription.unsubscribe();
      }
      this.meetingSubscription = this.meetingService.getMeetingById(this.meetingId).pipe(take(1)).subscribe(meeting => {
        if (meeting) {
          this.meeting = meeting;
          this.isOrganizer = (this.email === this.meeting.organizer);
          this.initLocationUrl();
          this.fetchedResources += 1;
          if (this.fetchedResources >= this.totalResourcesToFetch) {
            this.isLoading = false;
          }
        } else {
          this.uiService.showSnackBar('Oops, meeting data not found', null, 3000);
          this.router.navigate(['/']);
        }
      },
      error => {
        console.log(error);
        this.isLoading = false;
        this.uiService.showSnackBar(error, null, 3000);
        this.router.navigate(['/']);
      });
    }

    getAttendees() {
      if (this.attendeesSubscription) {
        this.attendeesSubscription.unsubscribe();
      }
      this.attendeesSubscription = this.meetingService.getAllAttendees(this.meetingId).subscribe(attendees => {
        this.attendees = attendees;
        this.fetchedResources += 1;
        if (this.fetchedResources >= this.totalResourcesToFetch) {
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
    async accept() {
      try {
        const attendee = this.getAttendeeByEmail(this.email);
        const isNew = attendee.id === null;
        attendee.response = true;
        attendee.responseDate = new Date();
        await this.meetingService.saveAttendee(attendee, isNew);
      } catch (error) {
        console.log(error);
        this.uiService.showSnackBar(error, null, 3000);
        this.router.navigate(['/']);
      }
    }

    async decline() {
      try {
        const attendee = this.getAttendeeByEmail(this.email);
        const isNew = attendee.id === null;
        attendee.response = false;
        attendee.responseDate = new Date();
        await this.meetingService.saveAttendee(attendee, isNew);
      } catch (error) {
        console.log(error);
        this.uiService.showSnackBar(error, null, 3000);
        this.router.navigate(['/']);
      }
    }
    initLocationUrl() {
      if (this.meeting.location.latitude && this.meeting.location.longitude) {
        this.selectedLocationUrl = `https://www.google.com/maps?q=${this.meeting.location.latitude},${this.meeting.location.longitude}`;
      }
    }

    getAttendeeByEmail(email: string) {
      let attendee: Attendee = this.attendees.find((item) => {
        return item.email === email;
      });
      if (!attendee) {
        attendee = {
          id: null,
          email: this.email,
          meetingId: this.meeting.id,
          response: null,
          responseDate: null,
          attendance: false,
          attendanceDate: new Date()
        };
      }
      return attendee;
    }

    getHour(date: Date) {
      return this.hours.find((hour) => {
        return hour.hours === date.getHours() && hour.minutes === date.getMinutes();
      });
    }

    viewCalendar() {
      this.router.navigate(['../calendar'], {relativeTo: this.route});
    }

    viewMinutes() {
      this.router.navigate(['./minutes'], {relativeTo: this.route});
    }

    editMeeting() {
      this.router.navigate(['./edit'], {relativeTo: this.route});
    }

    ngOnDestroy() {
      if (this.meetingSubscription) {
        this.meetingSubscription.unsubscribe();
      }
      if (this.attendeesSubscription) {
        this.attendeesSubscription.unsubscribe();
      }
    }

}
