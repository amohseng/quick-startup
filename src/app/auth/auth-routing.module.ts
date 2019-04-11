import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { VerifyComponent } from './verify/verify.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {path: 'signup', component: SignupComponent},
  {path: 'login', component: LoginComponent},
  {path: 'verify', component: VerifyComponent},
  {path: 'changepassword', component: ChangePasswordComponent, canActivate: [AuthGuard]},
  {path: 'updateprofile', component: UpdateProfileComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
