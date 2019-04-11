import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { MaterialModule } from '../material.module';
import { AuthRoutingModule } from './auth-routing.module';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { VerifyComponent } from './verify/verify.component';


@NgModule({
  declarations: [LoginComponent, SignupComponent, ChangePasswordComponent, UpdateProfileComponent, VerifyComponent],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    AngularFireAuthModule,
    MaterialModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
