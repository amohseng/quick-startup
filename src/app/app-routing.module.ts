import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WelcomeComponent } from './welcome/welcome.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {path: '', component: WelcomeComponent, canActivate: [AuthGuard], pathMatch: 'full'},
  {path: 'meeting', loadChildren: './meeting/meeting.module#MeetingModule', canLoad: [AuthGuard]},
  {path: 'company', loadChildren: './company/company.module#CompanyModule', canLoad: [AuthGuard]},
  {path: '**', redirectTo: '/'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
