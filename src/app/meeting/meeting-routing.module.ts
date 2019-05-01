import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewCalendarComponent } from './view-calendar/view-calendar.component';
import { EditMeetingComponent } from './edit-meeting/edit-meeting.component';
import { ViewMeetingComponent } from './view-meeting/view-meeting.component';
import { ViewMinutesComponent } from './view-minutes/view-minutes.component';
import { EditMinutesComponent } from './edit-minutes/edit-minutes.component';
import { ActionLogComponent } from './action-log/action-log.component';

const routes: Routes = [
  {path: 'calendar', component: ViewCalendarComponent},
  {path: 'actions', component: ActionLogComponent},
  {path: 'new', component: EditMeetingComponent},
  {path: ':id', component: ViewMeetingComponent},
  {path: ':id/edit', component: EditMeetingComponent},
  {path: ':id/minutes', component: ViewMinutesComponent},
  {path: ':id/minutes/edit', component: EditMinutesComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeetingRoutingModule { }
