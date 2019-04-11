import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { UIService } from '../../util/ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  loadingStateSubscription: Subscription;
  constructor(private authService: AuthService, private uiService: UIService) { }

  ngOnInit() {
    this.loadingStateSubscription = this.uiService.loadingStateChanged.subscribe(state => {
      this.isLoading = state;
    });
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.authService.login({
        email: form.value.email,
        password: form.value.password
      });
    }
  }
  ngOnDestroy() {
    this.loadingStateSubscription.unsubscribe();
  }
}
