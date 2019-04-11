import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { JoinRequest } from '../models/join-request.model';
import { Employee } from '../models/employee.model';
import { Company } from '../models/company.model';
import { CompanyService } from '../company.service';
import { UIService } from 'src/app/util/ui.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-company-employees',
  templateUrl: './company-employees.component.html',
  styleUrls: ['./company-employees.component.css']
})
export class CompanyEmployeesComponent implements OnInit {
  @Input() isAdmin: boolean;
  @Input() email: string;
  @Input() company: Company;
  @Input() employee: Employee;
  @Input() companyJoinRequests: JoinRequest[];
  @Input() companyEmployees: Employee[];
  @Output() employeeLeftCompany = new EventEmitter<boolean>();

  isWriting = false;

  constructor(private companyService: CompanyService, private uiService: UIService,
    private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
  }

  async createJoinRequest(invitedUserEmail: string, formControl: FormControl) {
    this.isWriting = true;
    try {
      const joinRequestId = await this.companyService
      .createJoinRequest({
        id: null,
        email: invitedUserEmail,
        companyId: this.company.id,
        companyName: this.company.name,
        companyEmail: this.company.email,
        adminDisplayName: this.employee.displayName,
        adminPhotoURL: this.employee.photoURL
      });
      formControl.reset();
      this.isWriting = false;
      this.uiService.showSnackBar('Request sent successfully!', null, 3000);
    } catch (error) {
      console.log(error);
      this.isWriting = false;
      this.uiService.showSnackBar(error, null, 3000);
    }
  }

  async deleteJoinRequest(joinRequestId: string) {
    this.isWriting = true;
    try {
      await this.companyService.deleteJoinRequest(joinRequestId);
      this.isWriting = false;
      this.uiService.showSnackBar('Request deleted successfully!', null, 3000);
    } catch (error) {
      console.log(error);
      this.isWriting = false;
      this.uiService.showSnackBar(error, null, 3000);
    }
  }
  async deleteEmployee(employeeId: string, joinRequestId: string) {
    this.isWriting = true;
    try {
      if (employeeId === this.email) {
        this.employeeLeftCompany.emit(true);
      }
      await this.companyService.deleteEmployee(employeeId);
      await this.companyService.deleteJoinRequest(joinRequestId);
      if (employeeId === this.email && this.isAdmin) {
        await this.companyService.deleteCompany(this.company.id);
      }
      this.isWriting = false;
      this.uiService.showSnackBar('Employee deleted successfully!', null, 3000);
      if (employeeId === this.email) {
        this.router.navigate(['./join'], {relativeTo: this.route});
      }
    } catch (error) {
      console.log(error);
      this.isWriting = false;
      this.uiService.showSnackBar(error, null, 3000);
    }
  }

}
