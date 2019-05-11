import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { Subscription, interval } from 'rxjs';
import { take, map, distinctUntilChanged, startWith } from 'rxjs/operators';
import * as moment from 'moment';

import { CompanyService } from 'src/app/company/company.service';
import { MeetingService } from '../meeting.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UIService } from 'src/app/util/ui.service';
import { DateService } from 'src/app/util/date.service';
import { Action, ActionFilter, ActionFilterType, ActionStatus } from '../models/action.model';
import { ProfileData } from 'src/app/auth/models/profile-data.model';
import { Employee } from 'src/app/company/models/employee.model';
import { Company } from 'src/app/company/models/company.model';

@Component({
  selector: 'app-action-log',
  templateUrl: './action-log.component.html',
  styleUrls: ['./action-log.component.css']
})
export class ActionLogComponent implements OnInit, OnDestroy {
  actionStatus = ActionStatus;
  actionFilterType = ActionFilterType;
  today: Date = new Date();
  isLoading = false;
  email = '';
  profileData: ProfileData;
  companies: Company[];
  employee: Employee;
  actions: Action[] = [];
  employees: Employee[] = [];
  actionFilter: ActionFilter;
  showActionFilter = false;
  showActionUpdateStatus = '';

  timeElapsed: Map<string, any> = new Map();

  totalResourcesToFetch = 4;
  fetchedResources = 0;
  companiesSubscription: Subscription;
  employeeSubscription: Subscription;
  actionsSubscription: Subscription;
  employeesSubscription: Subscription;

  constructor(private companyService: CompanyService, private meetingService: MeetingService, private authService: AuthService,
    private uiService: UIService, public ds: DateService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading = true;
    this.email = this.authService.getEmail();
    this.profileData = this.authService.getProfile();
    this.actionFilter = {
      filterType: ActionFilterType.ActionBy,
      status: ActionStatus.Any,
      actionBy: this.email
    };
    this.getEmployee();
    this.getCompanies();
  }

  getEmployee() {
    this.employeeSubscription = this.companyService.getEmployee(this.email).pipe(take(1)).subscribe(employee => {
      this.employee = employee;
      this.fetchedResources += 1;
      this.getActions();
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

  getActions() {
    if (this.actionsSubscription) {
      this.actionsSubscription.unsubscribe();
    }
    this.actionsSubscription = this.meetingService.getActions(this.actionFilter).subscribe(actions => {
      this.actions = actions;
      this.actions.forEach((action) => {
        this.timeElapsed
            .set(action.id, interval(1000).pipe(startWith(moment(action.lastUpdated).fromNow(false)),
                                                map(() => moment(action.lastUpdated).fromNow(false)),
                                                distinctUntilChanged()));
      });
      this.fetchedResources += 1;
      this.getActionsEmployees();
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
      this.router.navigate(['/']);
    });
  }
  getActionsEmployees() {
    const ids: string[] = [];
    let counter = 0;
    this.actions.forEach(action => {
      if (ids.indexOf(action.actionBy) < 0 && !this.employees.find(employee => employee.id === action.actionBy)) {
        ids.push(action.actionBy);
      }
      if (action.followupBy !== 'none' && ids.indexOf(action.followupBy) < 0
          && !this.employees.find(employee => employee.id === action.followupBy)) {
        ids.push(action.followupBy);
      }
      if (ids.indexOf(action.lastUpdatedBy) < 0 && !this.employees.find(employee => employee.id === action.lastUpdatedBy)) {
        ids.push(action.lastUpdatedBy);
       }
    });

    if (ids.length > 0) {
      if (this.employeesSubscription) {
        this.employeesSubscription.unsubscribe();
      }
      this.employeesSubscription = this.companyService.getEmployees(ids).subscribe((employee: Employee) => {
        if (employee) {
          this.employees.push(employee);
        }
        counter++;
        if (counter === ids.length) {
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
    } else {
      this.fetchedResources += 1;
      if (this.fetchedResources >= this.totalResourcesToFetch) {
        this.isLoading = false;
      }
    }
  }
  search(filterTypeSelect: FormControl, statusSelect: FormControl, fromDateInput: FormControl, toDateInput: FormControl) {
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
    if (statusSelect.valid) {
      this.actionFilter.status = statusSelect.value;
    }

    if (fromDateInput.valid) {
      this.actionFilter.from = fromDateInput.value;
    }
    if (toDateInput.valid) {
      this.actionFilter.to = toDateInput.value;
    }
    this.isLoading = true;
    this.showActionFilter = false;
    this.fetchedResources = 2;
    this.getActions();

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

  getPhotoURL(invitation: string) {
    let photoURL = 'assets/img/profile/anonymous.png';
    const employee = this.employees.find((emp => {
      return emp.id === invitation;
    }));

    if (employee) {
      photoURL = employee.photoURL;
    }
    return photoURL;
  }

  getCompanyById(companyId: string) {
    return this.companies.find((company => {
      return company.id === companyId;
    }));
  }

  onCommentInputBlur(commentInput: FormControl) {
    if (!commentInput.valid) {
      commentInput.reset();
    }
  }

  async updateStatus(action: Action, actionStatus: ActionStatus, commentInput: FormControl) {
    try {
      const newValue: Action = {...action};
      newValue.status = actionStatus;
      newValue.statusComment = commentInput.value;
      newValue.lastUpdated = new Date();
      newValue.lastUpdatedBy = this.email;
      const actionId = await this.meetingService.saveAction(newValue);
      this.uiService.showSnackBar('Action status updated successfully!', null, 3000);
      this.showActionUpdateStatus = '';
    } catch (error) {
      console.log(error);
      this.uiService.showSnackBar(error, null, 3000);
    }
  }

  ngOnDestroy() {
    if (this.companiesSubscription) {
      this.companiesSubscription.unsubscribe();
    }
    if (this.employeeSubscription) {
      this.employeeSubscription.unsubscribe();
    }
    if (this.actionsSubscription) {
      this.actionsSubscription.unsubscribe();
    }
    if (this.employeesSubscription) {
      this.employeesSubscription.unsubscribe();
    }
  }
}
