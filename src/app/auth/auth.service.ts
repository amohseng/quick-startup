import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subject } from 'rxjs';
import { auth } from 'firebase/app';
import { AuthData } from './models/auth-data.model';
import { ProfileData } from './models/profile-data.model';
import { UIService } from '../util/ui.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private email = '';
  authChange: Subject<boolean> = new Subject<boolean>();
  profileChange: Subject<ProfileData> = new Subject<ProfileData>();

  constructor(private afAuth: AngularFireAuth, private router: Router, private uiService: UIService) { }

  initAuthListener() {
    this.afAuth.authState.subscribe(user => {
      if (user && user.emailVerified) {
        this.isAuthenticated = true;
        this.authChange.next(true);
        this.profileChange.next({
          displayName: user.displayName ? user.displayName : user.email,
          photoURL: user.photoURL ? user.photoURL : 'assets/img/profile/anonymous.png'
        });
        this.email = user.email;
        this.router.navigate(['/']);
      } else if (user && !user.emailVerified) {
        this.isAuthenticated = false;
        this.authChange.next(false);
        this.email = user.email;
        this.router.navigate(['/verify']);
      } else {
        this.isAuthenticated = false;
        this.authChange.next(false);
        this.email = '';
        this.router.navigate(['/login']);
      }
    });
  }

  signup(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.afAuth.auth.createUserWithEmailAndPassword(authData.email, authData.password)
    .then(result => {
      console.log(result.user);
      this.uiService.loadingStateChanged.next(false);
      this.sendEmailVerification();
    })
    .catch(error => {
      console.log(error.code);
      this.uiService.showSnackBar(error.message, null, 3000);
      this.uiService.loadingStateChanged.next(false);
    });
  }

  login(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.afAuth.auth.signInWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        console.log(result);
        this.uiService.loadingStateChanged.next(false);
      })
      .catch(error => {
        console.log(error.code);
        this.uiService.showSnackBar(error.message, null, 3000);
        this.uiService.loadingStateChanged.next(false);
      });
  }

  updateProfile(profileData: ProfileData) {
    this.uiService.loadingStateChanged.next(true);
    const user = this.afAuth.auth.currentUser;
    user.updateProfile({
      displayName: profileData.displayName,
      photoURL: profileData.photoURL
    })
    .then(() => {
      console.log('Profile updated');
      this.profileChange.next(profileData);
      this.uiService.loadingStateChanged.next(false);
    })
    .catch(error => {
      console.log(error.code);
      this.uiService.showSnackBar(error.message, null, 3000);
      this.uiService.loadingStateChanged.next(false);
    });
  }

  getProfile() {
    const user = this.afAuth.auth.currentUser;
    if (user) {
      return {
        displayName: user.displayName ? user.displayName : user.email,
        photoURL: user.photoURL ? user.photoURL : 'assets/img/profile/anonymous.png'
      };
    } else {
      return {
        displayName: '',
        photoURL: ''
      };
    }
  }

  sendEmailVerification() {
    this.uiService.loadingStateChanged.next(true);
    const user = this.afAuth.auth.currentUser;
    user.sendEmailVerification().then(() => {
      console.log('Email sent');
      this.uiService.showSnackBar('Email verification has been sent to your email', null, 3000);
      this.uiService.loadingStateChanged.next(false);
    }).catch((error) => {
      console.log(error.code);
      this.uiService.showSnackBar(error.message, null, 3000);
      this.uiService.loadingStateChanged.next(false);
    });
  }

  changePassword(oldePassword: string, newPassword: string) {
    this.uiService.loadingStateChanged.next(true);
    const user = this.afAuth.auth.currentUser;
    const credential = auth.EmailAuthProvider.credential(user.email, oldePassword);
    user.reauthenticateAndRetrieveDataWithCredential(credential)
    .then(() => {
      return user.updatePassword(newPassword);
    })
    .then(() => {
      console.log('Password Updated');
      this.uiService.showSnackBar('Your password has been updated.', null, 3000);
      this.uiService.loadingStateChanged.next(false);
      this.router.navigate(['/']);
    })
    .catch((error) => {
      console.log(error.code);
      this.uiService.showSnackBar(error.message, null, 3000);
      this.uiService.loadingStateChanged.next(false);
    });
  }

  logout() {
    this.afAuth.auth.signOut();
    this.router.navigate(['/login']);
  }
  getEmail() {
    return this.email;
  }
  isAuth() {
    return this.isAuthenticated;
  }
}
