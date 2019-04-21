import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '../material.module';
import { MeetingRoutingModule } from './meeting-routing.module';
import { ViewCalendarComponent } from './view-calendar/view-calendar.component';
import { ManageActionsComponent } from './manage-actions/manage-actions.component';
import { CalendarWeekViewComponent } from './calendar/calendar-week-view/calendar-week-view.component';
import { CalendarHeaderComponent } from './calendar/calendar-header/calendar-header.component';
import { EditMeetingComponent } from './edit-meeting/edit-meeting.component';
import { ViewMeetingComponent } from './view-meeting/view-meeting.component';
import { SelectUsersComponent } from './select-users/select-users.component';
import { CalendarDayViewComponent } from './calendar/calendar-day-view/calendar-day-view.component';
import { CheckMeetingRoomAvailabilityComponent } from './check-meeting-room-availability/check-meeting-room-availability.component';
import { ViewMinutesComponent } from './view-minutes/view-minutes.component';
import { EditMinutesComponent } from './edit-minutes/edit-minutes.component';


@NgModule({
  declarations: [
    ViewCalendarComponent,
    ManageActionsComponent,
    CalendarWeekViewComponent,
    CalendarHeaderComponent,
    EditMeetingComponent,
    ViewMeetingComponent,
    SelectUsersComponent,
    CalendarDayViewComponent,
    CheckMeetingRoomAvailabilityComponent,
    ViewMinutesComponent,
    EditMinutesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MaterialModule,
    MeetingRoutingModule
  ],
  entryComponents: [
    SelectUsersComponent,
    CheckMeetingRoomAvailabilityComponent
  ]
})
export class MeetingModule { }
