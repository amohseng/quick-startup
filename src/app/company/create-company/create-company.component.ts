import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../company.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UIService } from 'src/app/util/ui.service';
import { ProfileData } from 'src/app/auth/models/profile-data.model';

@Component({
  selector: 'app-create-company',
  templateUrl: './create-company.component.html',
  styleUrls: ['./create-company.component.css']
})
export class CreateCompanyComponent implements OnInit, OnDestroy {
  isWriting = false;
  email = '';
  profileData: ProfileData;
  constructor(private companyService: CompanyService, private authService: AuthService,
    private uiService: UIService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.email = this.authService.getEmail();
    this.profileData = this.authService.getProfile();
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.createCompany(form.value.name);
    }
  }

  async createCompany(name: string) {
    this.isWriting = true;
    try {
      const companyId = await this.companyService.createCompany({id: null, name: name, email: this.email});
      const joinRequestId = await this.companyService
      .createJoinRequest({
        id: null,
        email: this.email,
        companyId: companyId,
        companyName: name,
        companyEmail: this.email,
        adminDisplayName: this.profileData.displayName,
        adminPhotoURL: this.profileData.photoURL
      });
      await this.companyService
      .createEmployee({
        id: this.email,
        companyId: companyId,
        joinRequestId: joinRequestId,
        displayName: this.profileData.displayName,
        photoURL: this.profileData.photoURL
      });
      this.isWriting = false;
      this.uiService.showSnackBar('Your company created successfully!', null, 3000);
      this.router.navigate(['/company']);
    } catch (error) {
      console.log(error);
      this.uiService.loadingStateChanged.next(false);
      this.uiService.showSnackBar(error, null, 3000);
    }
  }

  ngOnDestroy() {
  }

}

