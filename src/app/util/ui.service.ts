import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar, MatIconRegistry } from '@angular/material';
import { Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class UIService {
  constructor(private snackbar: MatSnackBar, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('outline-shopping_cart',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-shopping_cart-24px.svg'));
    iconRegistry.addSvgIcon('outline-cancel',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-cancel-24px.svg'));
    iconRegistry.addSvgIcon('outline-settings',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-settings-24px.svg'));
    iconRegistry.addSvgIcon('outline-edit',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-edit-24px.svg'));
    iconRegistry.addSvgIcon('outline-shopping_basket',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-shopping_basket-24px.svg'));
    iconRegistry.addSvgIcon('outline-save',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-save-24px.svg'));
    iconRegistry.addSvgIcon('outline-remove_shopping_cart',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-remove_shopping_cart-24px.svg'));
    iconRegistry.addSvgIcon('outline-check_box',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-check_box-24px.svg'));
    iconRegistry.addSvgIcon('outline-local_offer',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-local_offer-24px.svg'));
    iconRegistry.addSvgIcon('outline-local_cafe',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-local_cafe-24px.svg'));
    iconRegistry.addSvgIcon('outline-meeting_room',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-meeting_room-24px.svg'));
    iconRegistry.addSvgIcon('outline-location_on',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-location_on-24px.svg'));
    iconRegistry.addSvgIcon('outline-add_location',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-add_location-24px.svg'));
    iconRegistry.addSvgIcon('outline-map',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-map-24px.svg'));
    iconRegistry.addSvgIcon('outline-description',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-description-24px.svg'));
    iconRegistry.addSvgIcon('outline-send',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-send-24px.svg'));
    iconRegistry.addSvgIcon('outline-how_to_reg',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-how_to_reg-24px.svg'));
    iconRegistry.addSvgIcon('outline-speaker',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/outline-speaker-24px.svg'));
    iconRegistry.addSvgIcon('contract',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/contract.svg'));
    iconRegistry.addSvgIcon('writing',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/writing.svg'));
    iconRegistry.addSvgIcon('appointment',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/appointment.svg'));
    iconRegistry.addSvgIcon('whiteboard',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/whiteboard.svg'));
  }

  loadingStateChanged: Subject<boolean> = new Subject<boolean>();
  showSnackBar(message: string, action: string, duration: number) {
    this.snackbar.open(message, action, {duration: duration});
  }
}
