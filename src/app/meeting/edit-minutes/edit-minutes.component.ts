import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { MeetingService } from '../meeting.service';
import { CompanyService } from 'src/app/company/company.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UIService } from 'src/app/util/ui.service';
import { DateService } from 'src/app/util/date.service';

import { ProfileData } from 'src/app/auth/models/profile-data.model';
import { Meeting } from '../models/meeting.model';
import { Minutes } from '../models/minutes.model';

@Component({
  selector: 'app-edit-minutes',
  templateUrl: './edit-minutes.component.html',
  styleUrls: ['./edit-minutes.component.css']
})
export class EditMinutesComponent implements OnInit {
  isLoading = false;
  isWriting = false;
  email = '';
  profileData: ProfileData;
  meetingId = '';
  meeting: Meeting;
  minutes: Minutes;

  totalResourcesToFetch = 2;
  fetchedResources = 0;
  meetingSubscription: Subscription;
  minutesSubscription: Subscription;

  constructor(private meetingService: MeetingService, private companyService: CompanyService,
    private authService: AuthService, private uiService: UIService, public ds: DateService,
    private router: Router, private route: ActivatedRoute, public dialog: MatDialog) { }

  ngOnInit() {
  }

  getMeeting() {
    this.meetingSubscription = this.meetingService.getMeetingById(this.meetingId).pipe(take(1)).subscribe(meeting => {
      if (meeting) {
        this.meeting = meeting;
        this.fetchedResources += 1;
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

  getMinutes() {
    this.minutesSubscription = this.meetingService.getMinutesById(this.meetingId).pipe(take(1)).subscribe(minutes => {
      this.minutes = minutes;
      this.fetchedResources += 1;
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
      this.router.navigate(['/']);
    });
  }

  async saveMinutes(form: NgForm) {
    this.isWriting = true;
    try {
      const minutesId = await this.meetingService.saveMinutes(this.minutes);
      this.uiService.showSnackBar('Meeting saved successfully!', null, 3000);
      this.isWriting = false;
      this.router.navigate(['../'], {relativeTo: this.route});
    } catch (error) {
      console.log(error);
      this.uiService.showSnackBar(error, null, 3000);
    }
  }

  cancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

}
