import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ProfileData } from 'src/app/auth/models/profile-data.model';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() sidenav;
  authenticated = false;
  profileData: ProfileData;
  authSubscription: Subscription;
  profileSubscription: Subscription;
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authenticated = this.authService.isAuth();
    this.authSubscription = this.authService.authChange.subscribe((status) => {
      this.authenticated = status;
    });
    this.profileSubscription = this.authService.profileChange.subscribe((data) => {
      this.profileData = data;
    });

  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
    this.profileSubscription.unsubscribe();
  }

}
