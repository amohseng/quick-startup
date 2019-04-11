import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CompanyService } from '../company.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UIService } from 'src/app/util/ui.service';
import { JoinRequest } from '../models/join-request.model';
import { ProfileData } from 'src/app/auth/models/profile-data.model';

@Component({
  selector: 'app-join-company',
  templateUrl: './join-company.component.html',
  styleUrls: ['./join-company.component.css']
})
export class JoinCompanyComponent implements OnInit, OnDestroy {
  isLoading = false;
  isWriting = false;
  joinRequests: JoinRequest[];
  email = '';
  profileData: ProfileData;
  joinRequestsSubscription: Subscription;
  constructor(private companyService: CompanyService, private authService: AuthService, private uiService: UIService,
    private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.email = this.authService.getEmail();
    this.profileData = this.authService.getProfile();
    this.getJoinRequests();
  }
  getJoinRequests() {
    this.isLoading = true;
    this.joinRequestsSubscription = this.companyService.getJoinRequestsByInvitedUserEmail(this.email).subscribe(joinRequests => {
      this.joinRequests = joinRequests;
      this.isLoading = false;
    },
    error => {
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
      this.router.navigate(['/']);
    });
  }
  async createEmployee(joinRequest: JoinRequest) {
    this.isWriting = true;
    try {
      await this.companyService.createEmployee({
        id: this.email,
        companyId: joinRequest.companyId,
        joinRequestId: joinRequest.id,
        displayName: this.profileData.displayName,
        photoURL: this.profileData.photoURL
      });
      this.isWriting = false;
      this.router.navigate(['/company']);
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
    } catch (error) {
      console.log(error);
      this.isWriting = false;
      this.uiService.showSnackBar(error, null, 3000);
    }
  }

  createCompany() {
    this.router.navigate(['../create'], {relativeTo: this.route});
  }
  ngOnDestroy() {
    if (this.joinRequestsSubscription) {
      this.joinRequestsSubscription.unsubscribe();
    }
  }
}
