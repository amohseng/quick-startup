import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {COMMA, ENTER, SPACE, SEMICOLON} from '@angular/cdk/keycodes';
import {MatChipInputEvent, MatDialog} from '@angular/material';
import { Subscription } from 'rxjs';
import { take, withLatestFrom, map } from 'rxjs/operators';

import { MeetingService } from '../meeting.service';
import { CompanyService } from 'src/app/company/company.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UIService } from 'src/app/util/ui.service';
import { DateService } from 'src/app/util/date.service';

import { ProfileData } from 'src/app/auth/models/profile-data.model';
import { Employee } from 'src/app/company/models/employee.model';
import { Location } from 'src/app/company/models/location.model';
import { MeetingRoom } from 'src/app/company/models/meeting-room.model';
import { Meeting } from '../models/meeting.model';
import { SelectUsersComponent } from '../select-users/select-users.component';
import { CheckMeetingRoomAvailabilityComponent } from '../check-meeting-room-availability/check-meeting-room-availability.component';


@Component({
  selector: 'app-edit-meeting',
  templateUrl: './edit-meeting.component.html',
  styleUrls: ['./edit-meeting.component.css']
})
export class EditMeetingComponent implements OnInit, OnDestroy {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE, SEMICOLON];
  newMeetingDate = null;
  newMeetingStartTime = null;
  newMeetingEndTime = null;
  meetingId = '';
  editMode = false;
  meetingDuration = 0;
  selectedLocationUrl = '';
  selectedMeetingRoom: MeetingRoom;
  isLoading = false;
  isWriting = false;

  email = '';
  profileData: ProfileData;

  meeting: Meeting;
  employee: Employee;
  companyLocations: Location[];
  meetingRooms: MeetingRoom[];

  totalResourcesToFetch = 4;
  fetchedResources = 0;
  meetingSubscription: Subscription;
  employeeSubscription: Subscription;
  companyLocationsSubscription: Subscription;
  companyMeetingRoomsSubscription: Subscription;

  constructor(private meetingService: MeetingService, private companyService: CompanyService,
              private authService: AuthService, private uiService: UIService, public ds: DateService,
              private router: Router, private route: ActivatedRoute, public dialog: MatDialog) { }

    ngOnInit() {
      this.isLoading = true;
      this.email = this.authService.getEmail();
      this.profileData = this.authService.getProfile();
      this.route.params
      .pipe(
        withLatestFrom(this.route.queryParams),
        map(([params, queryParams]) => {
          return {
            params: params,
            queryParams: queryParams
          };
        })
      )
      .subscribe((result) => {
        this.newMeetingDate = result.queryParams['meetingDate'];
        this.newMeetingStartTime = result.queryParams['startTime'];
        this.newMeetingEndTime = result.queryParams['endTime'];
        this.meetingId = result.params['id'];
        this.editMode = result.params['id'] != null;
        this.initMeeting();
      });
      this.getEmployee();
    }

    initMeeting() {
      if (this.editMode) {
        this.getMeeting();
      } else {
        this.setNewMeeting();
      }
    }

    getMeeting() {
      this.meetingSubscription = this.meetingService.getMeetingById(this.meetingId).pipe(take(1)).subscribe(meeting => {
        if (meeting) {
          this.meeting = meeting;
          this.initMeetingDuration();
          this.fetchedResources += 1;
        } else {
          this.uiService.showSnackBar('Oops, meeting data not found', null, 3000);
          this.router.navigate(['/']);
        }
      },
      error => {
        console.log(error);
        this.isLoading = false;
        this.uiService.showSnackBar(error, null, 3000);
        this.router.navigate(['/']);
      });
    }

    setNewMeeting() {
      let start: Date, end: Date;
      if (this.newMeetingDate) {
        start = new Date(this.newMeetingDate);
        end = new Date(this.newMeetingDate);
        start.setHours(this.newMeetingStartTime);
        if (this.newMeetingEndTime === '24') {
          end.setHours(23);
          end.setMinutes(30);
        } else {
          end.setHours(this.newMeetingEndTime);
          end.setMinutes(0);
        }
      } else {
        start = new Date();
        end = new Date();
        start.setHours(9);
        end.setHours(10);
        end.setMinutes(0);
      }
      start.setMinutes(0);
      start.setSeconds(0);
      start.setMilliseconds(0);
      end.setSeconds(0);
      end.setMilliseconds(0);

      this.meeting = {
        id: null,
        organizer: this.email,
        subject: null,
        meetingRoom: {
          id: null,
          name: null,
          capacity: null,
          whiteboard: null,
          screen: null,
          loudSpeakers: null,
          microphones:  null,
          locationId: null,
          companyId: null,
          companyEmail: null
        },
        location: {
          id: null,
          name: null,
          latitude: null,
          longitude: null,
          companyId: null,
          companyEmail: null
        },
        start: start,
        end: end,
        invitations: [],
        scribes: [],
        canceled: false,
        companyId: null,
        companyEmail: null,
        lastUpdated: null
      };
      this.initMeetingDuration();
      this.fetchedResources += 1;
    }

    initMeetingDuration() {
      this.meetingDuration = (this.meeting.end.getTime() - this.meeting.start.getTime()) / (3600000);
    }

    getEmployee() {
      this.employeeSubscription = this.companyService.getEmployee(this.authService.getEmail()).pipe(take(1)).subscribe(employee => {
        if (employee) {
          if (employee.displayName !== this.profileData.displayName || employee.photoURL !== this.profileData.photoURL) {
            this.updateEmployee({...employee, displayName: this.profileData.displayName, photoURL: this.profileData.photoURL});
            this.employee = {...employee, displayName: this.profileData.displayName, photoURL: this.profileData.photoURL};
          } else {
            this.employee = employee;
          }
          this.fetchedResources += 1;
          this.getCompanyLocations();
          this.getCompanyMeetingRooms();
        } else {
          this.router.navigate(['/company/join']);
        }
      },
      error => {
        console.log(error);
        this.isLoading = false;
        this.uiService.showSnackBar(error, null, 3000);
        this.router.navigate(['/']);
      });
    }

    async updateEmployee(employee: Employee) {
      try {
        await this.companyService.createEmployee(employee);
      } catch (error) {
        console.log(error);
        this.uiService.showSnackBar(error, null, 3000);
        this.router.navigate(['/']);
      }
    }

    getCompanyLocations() {
      if (this.companyLocationsSubscription) {
         this.companyLocationsSubscription.unsubscribe();
       }
       this.companyLocationsSubscription = this.companyService
       .getLocationsByCompanyId(this.employee.companyId)
       .pipe(take(1))
       .subscribe(locations => {
           this.companyLocations = locations;
           this.fetchedResources += 1;
           if (this.fetchedResources >= this.totalResourcesToFetch) {
             this.isLoading = false;
           }
       },
       error => {
         console.log(error);
         this.isLoading = false;
         this.uiService.showSnackBar(error, null, 3000);
         this.router.navigate(['/']);
       });
     }

     getCompanyMeetingRooms() {
       if (this.companyMeetingRoomsSubscription) {
          this.companyMeetingRoomsSubscription.unsubscribe();
        }
        this.companyMeetingRoomsSubscription = this.companyService
        .getMeetingRoomsByCompanyId(this.employee.companyId)
        .pipe(take(1))
        .subscribe(meetingRooms => {
            this.meetingRooms = meetingRooms;
            if (this.editMode) {
              this.selectedMeetingRoom = this.getMeetingRoomById(this.meeting.meetingRoom.id);
              this.getLocationUrlById(this.selectedMeetingRoom.locationId);
            }
            this.fetchedResources += 1;
            if (this.fetchedResources >= this.totalResourcesToFetch) {
              this.isLoading = false;
            }
        },
        error => {
          console.log(error);
          this.isLoading = false;
          this.uiService.showSnackBar(error, null, 3000);
          this.router.navigate(['/']);
        });
      }

      getMeetingRoomById(id: string) {
        return this.meetingRooms.find(room => room.id === id);
      }

      getLocationById(id: string) {
        return this.companyLocations.find(location => location.id === id);
      }
      getLocationUrlById(id: string) {
        const location = this.getLocationById(id);
        this.selectedLocationUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      }

      cancel() {
        if (this.editMode) {
          this.router.navigate(['../'], {relativeTo: this.route});
        } else {
          this.router.navigate(['../calendar'], {relativeTo: this.route});
        }
      }

      async saveMeeting(form: NgForm) {
        this.addScribe(this.email);
        this.meeting.organizer = this.email;
        this.meeting.subject = form.value.subject;
        this.meeting.meetingRoom = this.getMeetingRoomById(form.value.meetingRoomId);
        this.meeting.location = this.getLocationById(this.meeting.meetingRoom.locationId);
        this.meeting.start = new Date(form.value.meetingDate);
        this.meeting.start.setHours(Math.floor(+form.value.startTime));
        this.meeting.start.setMinutes((+form.value.startTime - Math.floor(+form.value.startTime)) * 60);
        this.meeting.start.setSeconds(0);
        this.meeting.start.setMilliseconds(0);
        this.meeting.end = new Date(form.value.meetingDate);
        this.meeting.end.setHours(Math.floor(+form.value.endTime));
        this.meeting.end.setMinutes((+form.value.endTime - Math.floor(+form.value.endTime)) * 60);
        this.meeting.end.setSeconds(0);
        this.meeting.end.setMilliseconds(0);
        this.meeting.canceled = this.editMode ? form.value.canceled : false;
        this.meeting.companyId = this.meeting.meetingRoom.companyId;
        this.meeting.companyEmail = this.meeting.meetingRoom.companyEmail;
        this.meeting.lastUpdated = new Date();
        this.isWriting = true;
        try {
          const meetingId = await this.meetingService.saveMeeting(this.meeting, !this.editMode);
          this.uiService.showSnackBar('Meeting saved successfully!', null, 3000);
          this.isWriting = false;
          this.router.navigate(['/meeting/' + meetingId]);
        } catch (error) {
          console.log(error);
          this.uiService.showSnackBar(error, null, 3000);
        }
      }

      onMeetingRoomChange(change) {
        this.selectedMeetingRoom = this.getMeetingRoomById(change.value);
        this.getLocationUrlById(this.selectedMeetingRoom.locationId);
      }

      onStartTimeChange(change, endTime: number) {
        const startTime = +change.value;
        if (startTime >= endTime) {
          endTime = startTime + this.meetingDuration;
          this.meeting.end.setHours(Math.floor(endTime));
          this.meeting.end.setMinutes((endTime - Math.floor(endTime)) * 60);
        } else {
          this.meetingDuration = endTime - startTime;
        }
      }

      onEndTimeChange(change, startTime: number) {
        const endTime = +change.value;
        this.meetingDuration = endTime - startTime;
      }

      addInvitationChip(event: MatChipInputEvent) {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
          this.addInvitation(value.trim());
        }

        if (input) {
          input.value = '';
        }
      }

      addScribeChip(event: MatChipInputEvent) {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
          this.addScribe(value.trim());
        }

        if (input) {
          input.value = '';
        }
      }

      addInvitation(invitation: string) {
        const index = this.meeting.invitations.indexOf(invitation);
        if (index < 0) {
          this.meeting.invitations.push(invitation);
        }
      }

      addScribe(scribe: string) {
        const index = this.meeting.scribes.indexOf(scribe);
        if (index < 0) {
          this.meeting.scribes.push(scribe);
          this.addInvitation(scribe);
        }
      }

      removeInvitation(invitation: string) {
        const index = this.meeting.invitations.indexOf(invitation);
        if (index >= 0) {
          this.meeting.invitations.splice(index, 1);
          this.removeScribe(invitation);
        }
      }

      removeScribe(scribe: string) {
        const index = this.meeting.scribes.indexOf(scribe);
        if (index >= 0) {
          this.meeting.scribes.splice(index, 1);
        }
      }

      selectInvitations() {
        const dialogRef = this.dialog.open(SelectUsersComponent, {
          width: '360px',
          height: '450px',
          data: {selectedCompanyId: this.employee.companyId, organizer: this.meeting.organizer,
                 selectedUsers: [...this.meeting.invitations]}
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result && result.action === 'ok') {
            console.log(result.selectedUsers);
            this.meeting.invitations = [...result.selectedUsers];
            this.removeExcessScribes();
          }
        });
      }

      checkAvailability(meetingRoomId: string, calendarDate: Date) {
        const dialogRef = this.dialog.open(CheckMeetingRoomAvailabilityComponent, {
          data: {meetingRoomId: meetingRoomId, calendarDate: calendarDate}
        });
      }

      selectScribes() {
        const dialogRef = this.dialog.open(SelectUsersComponent, {
          width: '360px',
          height: '450px',
          data: {selectedCompanyId: this.employee.companyId, organizer: this.meeting.organizer,
                 selectedUsers: [...this.meeting.scribes]}
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result && result.action === 'ok') {
            console.log(result.selectedUsers);
            this.meeting.scribes = [...result.selectedUsers];
            this.addMissingInvitations();
          }
        });
      }

      addMissingInvitations() {
        for (const scribe of this.meeting.scribes) {
          if (this.meeting.invitations.indexOf(scribe) < 0) {
            this.addInvitation(scribe);
          }
        }
      }

      removeExcessScribes() {
        const scribesArr = [...this.meeting.scribes];
        for (const scribe of scribesArr) {
          if (this.meeting.invitations.indexOf(scribe) < 0) {
            this.removeScribe(scribe);
          }
        }
      }

      ngOnDestroy() {
        if (this.meetingSubscription) {
          this.meetingSubscription.unsubscribe();
        }
        if (this.employeeSubscription) {
          this.employeeSubscription.unsubscribe();
        }
        if (this.companyLocationsSubscription) {
          this.companyLocationsSubscription.unsubscribe();
        }
        if (this.companyMeetingRoomsSubscription) {
          this.companyMeetingRoomsSubscription.unsubscribe();
        }
      }

}
