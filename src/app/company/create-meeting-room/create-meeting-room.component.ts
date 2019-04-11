import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-create-meeting-room',
  templateUrl: './create-meeting-room.component.html',
  styleUrls: ['./create-meeting-room.component.css']
})
export class CreateMeetingRoomComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
