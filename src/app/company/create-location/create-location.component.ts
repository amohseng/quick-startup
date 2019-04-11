import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-create-location',
  templateUrl: './create-location.component.html',
  styleUrls: ['./create-location.component.css']
})
export class CreateLocationComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  getCurrentCoordinates() {
    navigator.geolocation.getCurrentPosition((pos) => {
      const crd = pos.coords;
      this.data.latitude = crd.latitude;
      this.data.longitude = crd.longitude;
    },
    (err) => {
      console.log(err);
    });
  }

}
