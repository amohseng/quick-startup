import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormControl } from '@angular/forms';
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
import { Employee } from 'src/app/company/models/employee.model';
import { Company } from 'src/app/company/models/company.model';

@Component({
  selector: 'app-view-minutes',
  templateUrl: './view-minutes.component.html',
  styleUrls: ['./view-minutes.component.css']
})
export class ViewMinutesComponent implements OnInit, OnDestroy {
  isLoading = false;
  isWriting = false;
  isScribe = false;
  email = '';
  profileData: ProfileData;
  meetingId = '';
  meeting: Meeting;
  employees: Employee[] = [];
  companies: Company[];
  allMinutesRevisions: Minutes[] = [];
  minutes: Minutes;


  totalResourcesToFetch = 4;
  fetchedResources = 0;
  meetingSubscription: Subscription;
  employeesSubscription: Subscription;
  companiesSubscription: Subscription;
  minutesSubscription: Subscription;

  constructor(private meetingService: MeetingService, private companyService: CompanyService,
    private authService: AuthService, private uiService: UIService, public ds: DateService,
    private router: Router, private route: ActivatedRoute, public dialog: MatDialog, private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this.isLoading = true;
    this.email = this.authService.getEmail();
    this.profileData = this.authService.getProfile();
    this.route.params.subscribe((params: Params) => {
      this.meetingId = params['id'];
      if (this.meetingId !== null) {
        this.getMeeting();
      } else {
        this.uiService.showSnackBar('Oops, meeting not identified', null, 3000);
        this.router.navigate(['/']);
      }
    });
  }

  getMeeting() {
    if (this.meetingSubscription) {
      this.meetingSubscription.unsubscribe();
    }
    this.meetingSubscription = this.meetingService.getMeetingById(this.meetingId).pipe(take(1)).subscribe(meeting => {
      if (meeting) {
        this.meeting = meeting;
        this.isScribe = this.meeting.scribes.indexOf(this.email) >= 0;
        this.fetchedResources += 1;
        this.getMinutes();
        this.getEmployees();
        this.getCompanies();
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
    if (this.minutesSubscription) {
      this.minutesSubscription.unsubscribe();
    }
    this.minutesSubscription = this.meetingService.getMinutesByMeetingId(this.meetingId).pipe(take(1)).subscribe(allMinutesRevisions => {
      this.allMinutesRevisions = allMinutesRevisions;
      if (this.allMinutesRevisions.length > 0) {
        this.minutes = this.allMinutesRevisions[this.allMinutesRevisions.length - 1];
      }
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

  getEmployees() {
    let counter = 0;
    if (this.employeesSubscription) {
      this.employeesSubscription.unsubscribe();
    }
    this.employeesSubscription = this.companyService.getEmployees(this.meeting.invitations)
    .subscribe((employee: Employee) => {
      if (employee) {
        this.employees.push(employee);
      }
      counter++;
      if (counter === this.meeting.invitations.length) {
        this.fetchedResources += 1;
        if (this.fetchedResources >= this.totalResourcesToFetch) {
          this.isLoading = false;
        }
      }
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
      this.router.navigate(['/']);
    });
  }

  getCompanies() {
    if (this.companiesSubscription) {
      this.companiesSubscription.unsubscribe();
    }
    this.companiesSubscription = this.companyService.getCompanies().pipe(take(1)).subscribe(companies => {
      this.companies = companies;
      this.fetchedResources += 1;
      if (this.fetchedResources >= this.totalResourcesToFetch) {
        this.isLoading = false;
      }
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
    });
  }

  checkAttendance(invitation: string) {
    let attendance = false;
    if (this.minutes) {
      const index = this.minutes.attendance.indexOf(invitation);
      if (index >= 0) {
        attendance = true;
      }
    }
    return attendance;
  }

  getDisplayName(invitation: string) {
    let displayName = invitation;
    const employee = this.employees.find((emp => {
      return emp.id === invitation;
    }));

    if (employee) {
      displayName = employee.displayName + ' (' + this.getCompanyById(employee.companyId).name + ')';
    }
    return displayName;
  }

  getCompanyById(companyId: string) {
    return this.companies.find((company => {
      return company.id === companyId;
    }));
  }

  cancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  editMinutes() {
    this.router.navigate(['./edit'], {relativeTo: this.route});
  }

  ngOnDestroy() {
    if (this.meetingSubscription) {
      this.meetingSubscription.unsubscribe();
    }
    if (this.minutesSubscription) {
      this.minutesSubscription.unsubscribe();
    }
    if (this.employeesSubscription) {
      this.employeesSubscription.unsubscribe();
    }
    if (this.companiesSubscription) {
      this.companiesSubscription.unsubscribe();
    }
  }

}
