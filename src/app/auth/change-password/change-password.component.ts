import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { UIService } from 'src/app/util/ui.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
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

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.authService.changePassword(form.value.password, form.value.newPassword);
    }
  }
  ngOnDestroy() {
    this.loadingStateSubscription.unsubscribe();
  }
}
