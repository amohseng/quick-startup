import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { Subscription, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../auth.service';
import { UIService } from 'src/app/util/ui.service';
import { ProfileData } from '../models/profile-data.model';

declare var loadImage: any;

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css']
})
export class UpdateProfileComponent implements OnInit, OnDestroy {
  uploadPercent: Observable<number>;
  isUploading = false;
  isLoading = false;
  email = '';
  profileData: ProfileData;
  loadingStateSubscription: Subscription;
  constructor(private storage: AngularFireStorage, private authService: AuthService, private uiService: UIService) { }

  ngOnInit() {
    this.profileData = this.authService.getProfile();
    this.email = this.authService.getEmail();
    this.loadingStateSubscription = this.uiService.loadingStateChanged.subscribe(state => {
      this.isLoading = state;
    });
  }

  uploadFile(event) {
    this.isUploading = true;
    const file: File = event.target.files[0];

    if (file.type.split('/')[0] !== 'image') {
      this.uiService.showSnackBar('Unsupported file type', null, 3000);
      return;
    }
    const now = (new Date()).toUTCString();
    const filePath = `img/${this.authService.getEmail()}/profile/${now}`;
    const fileRef = this.storage.ref(filePath);
    const ref = this;
    loadImage.parseMetaData(file, function(data) {
      // default image orientation
      let orientation = 0;
      // if exif data available, update orientation
      if (data.exif) {
          orientation = data.exif.get('Orientation');
      }
      const loadingImage = loadImage(
          file,
          function(canvas) {
              // here's the base64 data result
              const base64data = canvas.toDataURL('image/jpeg');

              const task = ref.storage.upload(filePath, ref.dataURItoBlob(base64data));

              // observe percentage changes
              ref.uploadPercent = task.percentageChanges();
              // get notified when the download URL is available
              task.snapshotChanges().pipe(
                  finalize(() => {
                    ref.profileData.photoURL = base64data;
                    fileRef.getDownloadURL().subscribe((url) => {
                      ref.profileData.photoURL = url;
                      ref.isUploading = false;
                    });
                  })
              )
              .subscribe();
          }, {
              // should be set to canvas : true to activate auto fix orientation
              canvas: true,
              orientation: orientation
          }
      );
  });
  }

  dataURItoBlob(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      let byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(dataURI.split(',')[1]);
      } else {
        byteString = unescape(dataURI.split(',')[1]);
      }

      // separate out the mime component
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to a typed array
      const ia = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ia], {type: mimeString});
  }

  updateProfile(form: NgForm) {
    if (form.valid) {
      if (this.profileData.displayName !== '' && this.profileData.photoURL !== '') {
        this.authService.updateProfile({...this.profileData});
      }
    }
  }

  ngOnDestroy() {
    this.loadingStateSubscription.unsubscribe();
  }


  /*
  uploadFile(event) {
    this.isUploading = true;
    const file: File = event.target.files[0];

    if (file.type.split('/')[0] !== 'image') {
      this.uiService.showSnackBar('Unsupported file type', null, 3000);
      return;
    }
    const now = (new Date()).toUTCString();
    const filePath = `img/${this.authService.getEmail()}/profile/${now}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
        finalize(() => {
          const reader = new FileReader();
          reader.onload = () => {
            this.profileData.photoURL = reader.result.toString();
          };
          reader.readAsDataURL(file);

          fileRef.getDownloadURL().subscribe((url) => {
            this.profileData.photoURL = url;
            this.isUploading = false;
          });
        })
     )
    .subscribe();
  }
  */

}
