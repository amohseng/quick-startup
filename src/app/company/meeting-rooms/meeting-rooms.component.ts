import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';

import { CompanyService } from '../company.service';
import { UIService } from 'src/app/util/ui.service';

import { Company } from '../models/company.model';
import { MeetingRoom } from '../models/meeting-room.model';
import { CreateMeetingRoomComponent } from '../create-meeting-room/create-meeting-room.component';
import { Location } from '../models/location.model';

@Component({
  selector: 'app-meeting-rooms',
  templateUrl: './meeting-rooms.component.html',
  styleUrls: ['./meeting-rooms.component.css']
})
export class MeetingRoomsComponent implements OnInit {
  isWriting = false;
  isUpdateCompanyName = false;

  @Input() isAdmin: boolean;
  @Input() company: Company;
  @Input() companyLocations: Location[];
  @Input() meetingRooms: MeetingRoom[];

  constructor(private companyService: CompanyService, private uiService: UIService, public dialog: MatDialog) { }

  ngOnInit() {
  }

  tryCreateMeetingRoom() {
    const dialogRef = this.dialog.open(CreateMeetingRoomComponent, {
      width: '360px',
      height: '450px',
      data: {action: 'create', name: '', capacity: '', whiteboard: false, screen: false,
      loudSpeakers: false, microphones: false, locationId: '', companyLocations: this.companyLocations}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'save') {
        this.createMeetingRoom(
          result.name, result.capacity, result.whiteboard, result.screen,
          result.loudSpeakers, result.microphones, result.locationId);
      }
    });
  }

  async createMeetingRoom(
    name: string, capacity: number, whiteboard: boolean, screen: boolean,
    loudSpeakers: boolean, microphones: boolean, locationId: string) {

    this.isWriting = true;
    try {
      const meetingRoomId = await this.companyService
      .createMeetingRoom({
        id: null,
        name: name,
        capacity: capacity,
        whiteboard: whiteboard,
        screen: screen,
        loudSpeakers: loudSpeakers,
        microphones: microphones,
        locationId: locationId,
        companyId: this.company.id,
        companyEmail: this.company.email
      });
      this.uiService.showSnackBar('Meeting room created successfully!', null, 3000);
      this.isWriting = false;
    } catch (error) {
      console.log(error);
      this.uiService.showSnackBar(error, null, 3000);
    }
  }

  tryUpdateMeetingRoom(meetingRoom: MeetingRoom) {

    const dialogRef = this.dialog.open(CreateMeetingRoomComponent, {
      width: '360px',
      height: '450px',
      data: {action: 'update', name: meetingRoom.name, capacity: meetingRoom.capacity, whiteboard: meetingRoom.whiteboard,
      screen: meetingRoom.screen, loudSpeakers: meetingRoom.loudSpeakers, microphones: meetingRoom.microphones,
      locationId: meetingRoom.locationId, companyLocations: this.companyLocations}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'save') {
        this.updateMeetingRoom(
          meetingRoom.id, result.name, result.capacity, result.whiteboard, result.screen,
          result.loudSpeakers, result.microphones, result.locationId);
      }
    });
  }

  async updateMeetingRoom(
    id: string, name: string, capacity: number, whiteboard: boolean, screen: boolean,
    loudSpeakers: boolean, microphones: boolean, locationId: string) {

    this.isWriting = true;
    try {
      await this.companyService
      .updateMeetingRoom({
        id: id,
        name: name,
        capacity: capacity,
        whiteboard: whiteboard,
        screen: screen,
        loudSpeakers: loudSpeakers,
        microphones: microphones,
        locationId: locationId,
        companyId: this.company.id,
        companyEmail: this.company.email
      });
      this.uiService.showSnackBar('Meeting room updated successfully!', null, 3000);
      this.isWriting = false;
    } catch (error) {
      console.log(error);
      this.uiService.showSnackBar(error, null, 3000);
    }
  }
  async deleteMeetingRoom(id: string) {
    this.isWriting = true;
    try {
      await this.companyService.deleteMeetingRoom(id);
      this.uiService.showSnackBar('MeetingRoom deleted successfully!', null, 3000);
      this.isWriting = false;
    } catch (error) {
      console.log(error);
      this.uiService.showSnackBar(error, null, 3000);
    }
  }

  getLocationById(id: string) {
    return this.companyLocations.find(location => location.id === id);
  }

}
