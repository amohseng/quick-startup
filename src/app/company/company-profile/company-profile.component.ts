import { Component, OnInit, Input } from '@angular/core';
import { Company } from '../models/company.model';
import { Employee } from '../models/employee.model';
import { Location } from '../models/location.model';
import { CompanyService } from '../company.service';
import { UIService } from 'src/app/util/ui.service';
import { CreateLocationComponent } from '../create-location/create-location.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.css']
})
export class CompanyProfileComponent implements OnInit {
  isWriting = false;
  isUpdateCompanyName = false;

  @Input() isAdmin: boolean;
  @Input() company: Company;
  @Input() employee: Employee;
  @Input() companyLocations: Location[];

  constructor(private companyService: CompanyService, private uiService: UIService, public dialog: MatDialog) { }

  ngOnInit() {
  }

  async updateCompanyName(companyName: string) {
    this.isWriting = true;
    try {
      await this.companyService.updateCompany({...this.company, name: companyName});
      this.company.name = companyName;
      this.isWriting = false;
      this.isUpdateCompanyName = false;
      this.uiService.showSnackBar('Company name updated successfully!', null, 3000);
    } catch (error) {
      console.log(error);
      this.isWriting = false;
      this.isUpdateCompanyName = false;
      this.uiService.showSnackBar(error, null, 3000);
    }
  }
  tryCreateLocation() {
    const dialogRef = this.dialog.open(CreateLocationComponent, {
      width: '360px',
      data: {action: 'create', locationName: '', latitude: '', longitude: ''}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'save') {
        this.createLocation(result.locationName, result.latitude, result.longitude);
      }
    });
  }

  async createLocation(locationName: string, latitude: string, longitude: string) {
    this.isWriting = true;
    try {
      const locationId = await this.companyService
      .createLocation({
        id: null,
        name: locationName,
        latitude: latitude,
        longitude: longitude,
        companyId: this.company.id,
        companyEmail: this.company.email
      });
      this.uiService.showSnackBar('Location created successfully!', null, 3000);
      this.isWriting = false;
    } catch (error) {
      console.log(error);
      this.uiService.showSnackBar(error, null, 3000);
    }
  }

  tryUpdateLocation(locationId: string, locationName: string, latitude: string, longitude: string) {
    const dialogRef = this.dialog.open(CreateLocationComponent, {
      width: '360px',
      data: {action: 'update', locationName: locationName, latitude: latitude, longitude: longitude}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'save') {
        this.updateLocation(locationId, result.locationName, result.latitude, result.longitude);
      }
    });
  }

  async updateLocation(locationId: string, locationName: string, latitude: string, longitude: string) {
    this.isWriting = true;
    try {
      await this.companyService
      .updateLocation({
        id: locationId,
        name: locationName,
        latitude: latitude,
        longitude: longitude,
        companyId: this.company.id,
        companyEmail: this.company.email
      });
      this.uiService.showSnackBar('Location updated successfully!', null, 3000);
      this.isWriting = false;
    } catch (error) {
      console.log(error);
      this.uiService.showSnackBar(error, null, 3000);
    }
  }
  async deleteLocation(locationId: string) {
    this.isWriting = true;
    try {
      await this.companyService.deleteLocation(locationId);
      this.uiService.showSnackBar('Location deleted successfully!', null, 3000);
      this.isWriting = false;
    } catch (error) {
      console.log(error);
      this.uiService.showSnackBar(error, null, 3000);
    }
  }

}
