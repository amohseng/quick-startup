import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewCompanyComponent } from './view-company/view-company.component';
import { JoinCompanyComponent } from './join-company/join-company.component';
import { CreateCompanyComponent } from './create-company/create-company.component';

const routes: Routes = [
  {path: '', component: ViewCompanyComponent},
  {path: 'join', component: JoinCompanyComponent},
  {path: 'create', component: CreateCompanyComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }
