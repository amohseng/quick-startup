import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {COMMA, ENTER, SPACE, SEMICOLON} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { MeetingService } from '../meeting.service';
import { CompanyService } from 'src/app/company/company.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UIService } from 'src/app/util/ui.service';
import { ProfileData } from 'src/app/auth/models/profile-data.model';
import { Employee } from 'src/app/company/models/employee.model';
import { Company } from 'src/app/company/models/company.model';
import { Location } from 'src/app/company/models/location.model';
import { MeetingRoom } from 'src/app/company/models/meeting-room.model';
import { Meeting } from '../models/meeting.model';


@Component({
  selector: 'app-edit-meeting',
  templateUrl: './edit-meeting.component.html',
  styleUrls: ['./edit-meeting.component.css']
})
export class EditMeetingComponent implements OnInit, OnDestroy {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE, SEMICOLON];
  readonly hours = [
    {value: 0, text: '12:00 AM', hours: 0, minutes: 0},
    {value: 0.5, text: '12:30 AM', hours: 0, minutes: 30},
    {value: 1, text: '01:00 AM', hours: 1, minutes: 0},
    {value: 1.5, text: '01:30 AM', hours: 1, minutes: 30},
    {value: 2, text: '02:00 AM', hours: 2, minutes: 0},
    {value: 2.5, text: '02:30 AM', hours: 2, minutes: 30},
    {value: 3, text: '03:00 AM', hours: 3, minutes: 0},
    {value: 3.5, text: '03:30 AM', hours: 3, minutes: 30},
    {value: 4, text: '04:00 AM', hours: 4, minutes: 0},
    {value: 4.5, text: '04:30 AM', hours: 4, minutes: 30},
    {value: 5, text: '05:00 AM', hours: 5, minutes: 0},
    {value: 5.5, text: '05:30 AM', hours: 5, minutes: 30},
    {value: 6, text: '06:00 AM', hours: 6, minutes: 0},
    {value: 6.5, text: '06:30 AM', hours: 6, minutes: 30},
    {value: 7, text: '07:00 AM', hours: 7, minutes: 0},
    {value: 7.5, text: '07:30 AM', hours: 7, minutes: 30},
    {value: 8, text: '08:00 AM', hours: 8, minutes: 0},
    {value: 8.5, text: '08:30 AM', hours: 8, minutes: 30},
    {value: 9, text: '09:00 AM', hours: 9, minutes: 0},
    {value: 9.5, text: '09:30 AM', hours: 9, minutes: 30},
    {value: 10, text: '10:00 AM', hours: 10, minutes: 0},
    {value: 10.5, text: '10:30 AM', hours: 10, minutes: 30},
    {value: 11, text: '11:00 AM', hours: 11, minutes: 0},
    {value: 11.5, text: '11:30 AM', hours: 11, minutes: 30},
    {value: 12, text: '12:00 PM', hours: 12, minutes: 0},
    {value: 12.5, text: '12:30 PM', hours: 12, minutes: 30},
    {value: 13, text: '01:00 PM', hours: 13, minutes: 0},
    {value: 13.5, text: '01:30 PM', hours: 13, minutes: 30},
    {value: 14, text: '02:00 PM', hours: 14, minutes: 0},
    {value: 14.5, text: '02:30 PM', hours: 14, minutes: 30},
    {value: 15, text: '03:00 PM', hours: 15, minutes: 0},
    {value: 15.5, text: '03:30 PM', hours: 15, minutes: 30},
    {value: 16, text: '04:00 PM', hours: 16, minutes: 0},
    {value: 16.5, text: '04:30 PM', hours: 16, minutes: 30},
    {value: 17, text: '05:00 PM', hours: 17, minutes: 0},
    {value: 17.5, text: '05:30 PM', hours: 17, minutes: 30},
    {value: 18, text: '06:00 PM', hours: 18, minutes: 0},
    {value: 18.5, text: '06:30 PM', hours: 18, minutes: 30},
    {value: 19, text: '07:00 PM', hours: 19, minutes: 0},
    {value: 19.5, text: '07:30 PM', hours: 19, minutes: 30},
    {value: 20, text: '08:00 PM', hours: 20, minutes: 0},
    {value: 20.5, text: '08:30 PM', hours: 20, minutes: 30},
    {value: 21, text: '09:00 PM', hours: 21, minutes: 0},
    {value: 21.5, text: '09:30 PM', hours: 21, minutes: 30},
    {value: 22, text: '10:00 PM', hours: 22, minutes: 0},
    {value: 22.5, text: '10:30 PM', hours: 22, minutes: 30},
    {value: 23, text: '11:00 PM', hours: 23, minutes: 0},
    {value: 23.5, text: '11:30 PM', hours: 23, minutes: 30}
  ];

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
  company: Company;
  companyLocations: Location[];
  meetingRooms: MeetingRoom[];

  totalResourcesToFetch = 4;
  fetchedResources = 0;
  meetingSubscription: Subscription;
  employeeSubscription: Subscription;
  companyLocationsSubscription: Subscription;
  companyMeetingRoomsSubscription: Subscription;

  constructor(private meetingService: MeetingService, private companyService: CompanyService,
              private authService: AuthService, private uiService: UIService,
              private router: Router, private route: ActivatedRoute) { }

    ngOnInit() {
      this.isLoading = true;
      this.email = this.authService.getEmail();
      this.profileData = this.authService.getProfile();
      this.route.params.subscribe((params: Params) => {
        this.meetingId = params['id'];
        this.editMode = params['id'] != null;
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
      const start = new Date();
      const end = new Date();
      start.setHours(9);
      start.setMinutes(0);
      start.setSeconds(0);
      end.setHours(10);
      end.setMinutes(0);
      end.setSeconds(0);

      this.meeting = {
        id: null,
        organizer: null,
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

      getHour(date: Date) {
        return this.hours.find((hour) => {
          return hour.hours === date.getHours() && hour.minutes === date.getMinutes();
        });
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
