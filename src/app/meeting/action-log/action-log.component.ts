import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { CompanyService } from 'src/app/company/company.service';
import { MeetingService } from '../meeting.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UIService } from 'src/app/util/ui.service';
import { DateService } from 'src/app/util/date.service';
import { Action, ActionFilter, ActionFilterType } from '../models/action.model';
import { ProfileData } from 'src/app/auth/models/profile-data.model';
import { Employee } from 'src/app/company/models/employee.model';

@Component({
  selector: 'app-action-log',
  templateUrl: './action-log.component.html',
  styleUrls: ['./action-log.component.css']
})
export class ActionLogComponent implements OnInit, OnDestroy {
  isLoading = false;
  email = '';
  profileData: ProfileData;
  employee: Employee;
  actions: Action[] = [];
  actionFilter: ActionFilter;
  showActionFilter = false;

  employeeSubscription: Subscription;
  actionsSubscription: Subscription;

  constructor(private companyService: CompanyService, private meetingService: MeetingService, private authService: AuthService,
    private uiService: UIService, public ds: DateService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading = true;
    this.email = this.authService.getEmail();
    this.profileData = this.authService.getProfile();
    this.actionFilter = {
      filterType: ActionFilterType.ActionBy,
      actionBy: this.email,
    };
    this.getEmployee();
  }

  getEmployee() {
    this.employeeSubscription = this.companyService.getEmployee(this.email).pipe(take(1)).subscribe(employee => {
      this.employee = employee;
      this.getActions();
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
      this.router.navigate(['/']);
    });
  }
  getActions() {
    if (this.actionsSubscription) {
      this.actionsSubscription.unsubscribe();
    }
    this.actionsSubscription = this.meetingService.getActions(this.actionFilter).pipe(take(1)).subscribe(actions => {
      this.actions = actions;
      console.log(this.actions);
      this.isLoading = false;
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
      this.router.navigate(['/']);
    });
  }
  search(filterTypeSelect: FormControl, fromDateInput: FormControl, toDateInput: FormControl) {
    this.actionFilter = {};
    if (filterTypeSelect.valid) {
      this.actionFilter.filterType = filterTypeSelect.value;
      if (this.actionFilter.filterType === ActionFilterType.ActionBy) {
        this.actionFilter.actionBy = this.email;
      } else if (this.actionFilter.filterType === ActionFilterType.FollowupBy) {
        this.actionFilter.followupBy = this.email;
      } else if (this.actionFilter.filterType === ActionFilterType.CompanyId && this.employee) {
        this.actionFilter.companyId = this.employee.companyId;
      }
    }
    if (fromDateInput.valid) {
      this.actionFilter.from = fromDateInput.value;
    }
    if (toDateInput.valid) {
      this.actionFilter.to = toDateInput.value;
    }
    this.isLoading = true;
    this.showActionFilter = false;
    this.getActions();

  }

  ngOnDestroy() {
    if (this.employeeSubscription) {
      this.employeeSubscription.unsubscribe();
    }
    if (this.actionsSubscription) {
      this.actionsSubscription.unsubscribe();
    }
  }
}
