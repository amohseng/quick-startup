import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { UIService } from 'src/app/util/ui.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit, OnDestroy {
  isLoading = false;
  email = '';
  loadingStateSubscription: Subscription;
  constructor(private authService: AuthService, private uiService: UIService) { }

  ngOnInit() {
    this.email = this.authService.getEmail();
    this.loadingStateSubscription = this.uiService.loadingStateChanged.subscribe(state => {
      this.isLoading = state;
    });
  }
  sendEmailVerification() {
    this.authService.sendEmailVerification();
  }
  logout() {
    this.authService.logout();
  }
  ngOnDestroy() {
    this.loadingStateSubscription.unsubscribe();
  }

}
