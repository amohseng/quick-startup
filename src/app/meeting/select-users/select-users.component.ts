import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CompanyService } from 'src/app/company/company.service';
import { UIService } from 'src/app/util/ui.service';
import { Company } from 'src/app/company/models/company.model';
import { Employee } from 'src/app/company/models/employee.model';

@Component({
  selector: 'app-select-users',
  templateUrl: './select-users.component.html',
  styleUrls: ['./select-users.component.css']
})
export class SelectUsersComponent implements OnInit, OnDestroy {
  isLoading = false;
  companies: Company[];
  employees: Employee[];
  selectedCompanyId: string;
  selectedUsers: string[];
  employeesSubscription: Subscription;
  companiesSubscription: Subscription;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private companyService: CompanyService,
                private uiService: UIService) { }

  ngOnInit() {
    this.selectedCompanyId = this.data.selectedCompanyId;
    this.selectedUsers = [...this.data.selectedUsers];
    this.getCompanies();
    this.getEmployeesByCompanyId();
  }

  getCompanies() {
    this.isLoading = true;
    if (this.companiesSubscription) {
      this.companiesSubscription.unsubscribe();
    }
    this.companiesSubscription = this.companyService.getCompanies().pipe(take(1)).subscribe(companies => {
      this.companies = companies;
      this.isLoading = false;
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
    });
  }

  getEmployeesByCompanyId() {
    if (this.employeesSubscription) {
      this.employeesSubscription.unsubscribe();
    }
    this.employeesSubscription = this.companyService.getEmployeesByCompanyId(this.selectedCompanyId).pipe(take(1)).subscribe(employees => {
      this.employees = employees;
    },
    error => {
      console.log(error);
      this.uiService.showSnackBar(error, null, 3000);
    });
  }

  onCompanyChange(change) {
    this.selectedCompanyId = change.value;
    this.getEmployeesByCompanyId();
  }

  toggleUserSelection(employeeId: string) {
    const index = this.selectedUsers.indexOf(employeeId);
    if (index < 0) {
      this.selectedUsers.push(employeeId);
    } else {
      this.selectedUsers.splice(index, 1);
    }
  }

  isSelected(employeeId: string) {
    const index = this.selectedUsers.indexOf(employeeId);
    return index >= 0;
  }

  ngOnDestroy() {
    if (this.companiesSubscription) {
      this.companiesSubscription.unsubscribe();
    }
    if (this.employeesSubscription) {
      this.employeesSubscription.unsubscribe();
    }
  }
}
