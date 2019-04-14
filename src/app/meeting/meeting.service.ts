import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

import { Meeting } from './models/meeting.model';
import { firestore } from 'firebase';
import { Attendee } from './models/attendee.model';
import { merge } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  constructor(private db: AngularFirestore) { }

  saveMeeting(meeting: Meeting, isNew: boolean): Promise<string> {
    if (isNew) {
      meeting.id = this.db.createId();
    }
    return this.db.collection('meetings').doc(meeting.id).set(meeting)
    .then(() => {
      return Promise.resolve(meeting.id);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Meeting not saved');
    });
  }

  saveAttendee(attendee: Attendee, isNew: boolean): Promise<string> {
    if (isNew) {
      attendee.id = this.db.createId();
    }
    return this.db.collection('attendees').doc(attendee.id).set(attendee)
    .then(() => {
      return Promise.resolve(attendee.id);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Attendee new status not saved');
    });
  }

  getMeetingsByAttendeeEmail(email: string, from: Date, to: Date) {
    return this.db.collection('meetings', ref => ref.where('invitations', 'array-contains', email)
                                                    .where('start', '>=', from)
                                                    .where('start', '<=', to))
      .snapshotChanges()
      .pipe(map(actions => actions.map(action => {
        const data = action.payload.doc.data() as Meeting;
        const id = action.payload.doc.id;
        const start = (data.start as unknown as firestore.Timestamp).toDate();
        const end = (data.end as unknown as firestore.Timestamp).toDate();
        return { ...data, id, start, end };
      })));
  }

  getMeetingById(meetingId: string) {
    return this.db.doc<Meeting>(`meetings/${meetingId}`).valueChanges()
    .pipe(map(data => {
      if (data) {
        const id = meetingId;
        const start = (data.start as unknown as firestore.Timestamp).toDate();
        const end = (data.end as unknown as firestore.Timestamp).toDate();
        return { ...data, id, start, end };
      } else {
        return data;
      }
    }));
  }

  getAttendee(meetingId: string, email: string) {
    return this.db.collection('attendees', ref => ref.where('meetingId', '==', meetingId)
                                                    .where('email', '==', email))
      .snapshotChanges()
      .pipe(map(actions => actions.map(action => {
        const data = action.payload.doc.data() as Attendee;
        const id = action.payload.doc.id;
        return { ...data, id };
      })));
  }

  getAllAttendees(meetingId: string) {
    return this.db.collection('attendees', ref => ref.where('meetingId', '==', meetingId))
      .snapshotChanges()
      .pipe(map(actions => actions.map(action => {
        const data = action.payload.doc.data() as Attendee;
        const id = action.payload.doc.id;
        return { ...data, id };
      })));
  }

  getAttendeeForEachMeeting(meetingIds: string[], email: string) {
    const list = [];
    for (const meetingId of meetingIds) {
      list.push(this.getAttendee(meetingId, email));
    }
    return merge(...list);
  }
}
