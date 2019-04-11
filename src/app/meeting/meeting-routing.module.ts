import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewCalendarComponent } from './view-calendar/view-calendar.component';
import { ManageActionsComponent } from './manage-actions/manage-actions.component';
import { EditMeetingComponent } from './edit-meeting/edit-meeting.component';
import { ViewMeetingComponent } from './view-meeting/view-meeting.component';
import { MinutesComponent } from './minutes/minutes.component';

const routes: Routes = [
  {path: 'calendar', component: ViewCalendarComponent},
  {path: 'actions', component: ManageActionsComponent},
  {path: 'new', component: EditMeetingComponent},
  {path: ':id', component: ViewMeetingComponent},
  {path: ':id/edit', component: EditMeetingComponent},
  {path: ':id/minutes', component: MinutesComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeetingRoutingModule { }