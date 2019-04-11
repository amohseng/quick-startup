import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CompanyService } from '../company.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UIService } from 'src/app/util/ui.service';
import { Employee } from '../models/employee.model';
import { Company } from '../models/company.model';
import { JoinRequest } from '../models/join-request.model';
import { ProfileData } from 'src/app/auth/models/profile-data.model';
import { Location } from '../models/location.model';
import { MeetingRoom } from '../models/meeting-room.model';

@Component({
  selector: 'app-view-company',
  templateUrl: './view-company.component.html',
  styleUrls: ['./view-company.component.css']
})
export class ViewCompanyComponent implements OnInit, OnDestroy {
  tabIndex = 0;
  isLoading = false;
  isAdmin = false;
  email = '';
  profileData: ProfileData;

  employee: Employee;
  company: Company;
  companyJoinRequests: JoinRequest[];
  companyEmployees: Employee[];
  companyLocations: Location[];
  meetingRooms: MeetingRoom[];

  totalResourcesToFetch = 6;
  fetchedResources = 0;
  employeeSubscription: Subscription;
  companySubscription: Subscription;
  companyJoinRequestsSubscription: Subscription;
  companyEmployeesSubscription: Subscription;
  companyLocationsSubscription: Subscription;
  companyMeetingRoomsSubscription: Subscription;

  constructor(private companyService: CompanyService, private authService: AuthService, private uiService: UIService,
    private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading = true;
    this.email = this.authService.getEmail();
    this.profileData = this.authService.getProfile();
    this.getEmployee();
  }
  getEmployee() {
    this.employeeSubscription = this.companyService.getEmployee(this.authService.getEmail()).pipe(take(1)).subscribe(employee => {
      if (employee) {
        if (employee.displayName !== this.profileData.displayName || employee.photoURL !== this.profileData.photoURL) {
          this.updateEmployee({...employee, displayName: this.profileData.displayName, photoURL: this.profileData.photoURL});
          this.employee = {...employee, displayName: this.profileData.displayName, photoURL: this.profileData.photoURL};
        } else {
          this.employee = employee;
        }
        this.fetchedResources += 1;
        this.getCompany();
      } else {
        this.router.navigate(['./join'], {relativeTo: this.route});
      }
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
      this.router.navigate(['/']);
    });
  }

  async updateEmployee(employee: Employee) {
    try {
      await this.companyService.createEmployee(employee);
    } catch (error) {
      console.log(error);
      this.uiService.showSnackBar(error, null, 3000);
      this.router.navigate(['/']);
    }
  }

  getCompany() {
    this.companySubscription = this.companyService.getCompany(this.employee.companyId).pipe(take(1)).subscribe(company => {
      if (company) {
        this.company = company;
        this.isAdmin = this.email === this.company.email ? true : false;
        this.fetchedResources += 1;
        this.getCompanyEmployees();
        this.getCompanyLocations();
        this.getCompanyMeetingRooms();
      } else {
        this.uiService.showSnackBar('Oops, company data not found', null, 3000);
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

  getCompanyEmployees() {
    if (this.companyEmployeesSubscription) {
      this.companyEmployeesSubscription.unsubscribe();
    }
    this.companyEmployeesSubscription = this.companyService
    .getEmployeesByCompanyId(this.employee.companyId)
    .subscribe(employees => {
        this.companyEmployees = employees;
        this.fetchedResources += 1;
        this.getCompanyJoinRequests();
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
      this.router.navigate(['/']);
    });
  }

  getCompanyJoinRequests() {
    if (this.companyJoinRequestsSubscription) {
      this.companyJoinRequestsSubscription.unsubscribe();
    }
    this.companyJoinRequestsSubscription = this.companyService
    .getJoinRequestsByCompanyId(this.employee.companyId, this.companyEmployees.map(employee => employee.joinRequestId))
    .subscribe(joinRequests => {
        this.companyJoinRequests = joinRequests;
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

  getCompanyLocations() {
   if (this.companyLocationsSubscription) {
      this.companyLocationsSubscription.unsubscribe();
    }
    this.companyLocationsSubscription = this.companyService
    .getLocationsByCompanyId(this.employee.companyId)
    .subscribe(locations => {
        this.companyLocations = locations;
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

  getCompanyMeetingRooms() {
    if (this.companyMeetingRoomsSubscription) {
       this.companyMeetingRoomsSubscription.unsubscribe();
     }
     this.companyMeetingRoomsSubscription = this.companyService
     .getMeetingRoomsByCompanyId(this.employee.companyId)
     .subscribe(meetingRooms => {
         this.meetingRooms = meetingRooms;
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

  onEmployeeLeaveCompany(event) {
    this.companyEmployeesSubscription.unsubscribe();
    this.companyJoinRequestsSubscription.unsubscribe();
    this.companyLocationsSubscription.unsubscribe();
    this.companyMeetingRoomsSubscription.unsubscribe();
  }

  onSwipe(event) {
    const maxIndex = 2;
    if (event.type === 'swiperight' && this.tabIndex > 0) {
      this.tabIndex -= 1;
    } else if (event.type === 'swipeleft' && this.tabIndex < maxIndex) {
      this.tabIndex += 1;
    }
  }

  onIndexChange(event) {
    this.tabIndex = event;
  }

  ngOnDestroy() {
    if (this.employeeSubscription) {
      this.employeeSubscription.unsubscribe();
    }
    if (this.companySubscription) {
      this.companySubscription.unsubscribe();
    }
    if (this.companyEmployeesSubscription) {
      this.companyEmployeesSubscription.unsubscribe();
    }
    if (this.companyJoinRequestsSubscription) {
      this.companyJoinRequestsSubscription.unsubscribe();
    }
    if (this.companyLocationsSubscription) {
      this.companyLocationsSubscription.unsubscribe();
    }
    if (this.companyMeetingRoomsSubscription) {
      this.companyMeetingRoomsSubscription.unsubscribe();
    }
  }
}
