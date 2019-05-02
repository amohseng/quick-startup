import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manage-actions',
  templateUrl: './manage-actions.component.html',
  styleUrls: ['./manage-actions.component.css']
})
export class ManageActionsComponent implements OnInit {
  tabIndex = 0;
  constructor() { }

  ngOnInit() {
  }

  onSwipe(event) {
    const maxIndex = 1;
    if (event.type === 'swiperight' && this.tabIndex > 0) {
      this.tabIndex -= 1;
    } else if (event.type === 'swipeleft' && this.tabIndex < maxIndex) {
      this.tabIndex += 1;
    }
  }

  onIndexChange(event) {
    this.tabIndex = event;
  }

}
