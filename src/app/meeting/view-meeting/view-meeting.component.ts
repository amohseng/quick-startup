import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { MeetingService } from '../meeting.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UIService } from 'src/app/util/ui.service';
import { Meeting } from '../models/meeting.model';
import { Attendee } from '../models/attendee.model';
import { ProfileData } from 'src/app/auth/models/profile-data.model';
import { DateService } from 'src/app/util/date.service';


@Component({
  selector: 'app-view-meeting',
  templateUrl: './view-meeting.component.html',
  styleUrls: ['./view-meeting.component.css']
})
export class ViewMeetingComponent implements OnInit, OnDestroy {
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
              private router: Router, private route: ActivatedRoute, public ds: DateService) { }

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
      this.meetingSubscription = this.meetingService.getMeetingById(this.meetingId).subscribe(meeting => {
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
