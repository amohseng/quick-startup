import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '../material.module';
import { CompanyRoutingModule } from './company-routing.module';

import { ViewCompanyComponent } from './view-company/view-company.component';
import { JoinCompanyComponent } from './join-company/join-company.component';
import { CreateCompanyComponent } from './create-company/create-company.component';
import { CompanyEmployeesComponent } from './company-employees/company-employees.component';
import { CompanyProfileComponent } from './company-profile/company-profile.component';
import { MeetingRoomsComponent } from './meeting-rooms/meeting-rooms.component';
import { CreateLocationComponent } from './create-location/create-location.component';
import { CreateMeetingRoomComponent } from './create-meeting-room/create-meeting-room.component';

@NgModule({
  declarations: [
    ViewCompanyComponent,
    JoinCompanyComponent,
    CreateCompanyComponent,
    CompanyEmployeesComponent,
    CompanyProfileComponent,
    MeetingRoomsComponent,
    CreateLocationComponent,
    CreateMeetingRoomComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MaterialModule,
    CompanyRoutingModule
  ],
  entryComponents: [
    CreateLocationComponent,
    CreateMeetingRoomComponent
  ]
})
export class CompanyModule { }
