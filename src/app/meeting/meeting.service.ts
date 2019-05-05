import { Injectable } from '@angular/core';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { firestore } from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';

import { Meeting } from './models/meeting.model';
import { InvitationResponse } from './models/invitation-response.model';
import { Minutes } from './models/minutes.model';
import { Comment } from './models/comment.model';
import { Action, ActionFilter } from './models/action.model';




@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  constructor(private db: AngularFirestore) { }

  getDBId() {
    return this.db.createId();
  }

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

  saveMinutes(minutes: Minutes): Promise<string> {
    return this.db.collection('minutes').doc(minutes.id).set(minutes)
    .then(() => {
      return Promise.resolve(minutes.id);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Meeting minutes not saved');
    });
  }

  saveInvitationResponse(invitationResponse: InvitationResponse, isNew: boolean): Promise<string> {
    if (isNew) {
      invitationResponse.id = this.db.createId();
    }
    return this.db.collection('invitationResponses').doc(invitationResponse.id).set(invitationResponse)
    .then(() => {
      return Promise.resolve(invitationResponse.id);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Invitation response not saved');
    });
  }

  saveComment(comment: Comment): Promise<string> {
    comment.id = this.db.createId();
    return this.db.collection('comments').doc(comment.id).set(comment)
    .then(() => {
      return Promise.resolve(comment.id);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Comment not saved');
    });
  }

  saveAction(action: Action): Promise<string> {
    return this.db.collection('actions').doc(action.id).set(action)
    .then(() => {
      return Promise.resolve(action.id);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Action not saved');
    });
  }

  getMeetingsByInvitation(email: string, from: Date, to: Date) {
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

  getMeetingsByMeetingRoomId(meetingRoomId: string, from: Date, to: Date) {
    return this.db.collection('meetings', ref => ref.where('meetingRoom.id', '==', meetingRoomId)
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

  getMinutesByMeetingId(meetingId: string) {
    return this.db.doc<Minutes>(`minutes/${meetingId}`).valueChanges()
    .pipe(map(data => {
      if (data) {
        const id = meetingId;
        const lastUpdated = (data.lastUpdated as unknown as firestore.Timestamp).toDate();
        const topics = data.topics.map(topic => {
          topic.items = topic.items.map(item => {
            item.dueDate = (item.dueDate as unknown as firestore.Timestamp).toDate();
            return item;
          });
          return topic;
        });
        return { ...data, id, topics, lastUpdated };
      } else {
        return data;
      }
    }));
  }

  getInvitationResponse(meetingId: string, email: string) {
    return this.db.collection('invitationResponses', ref => ref.where('meetingId', '==', meetingId)
                                                    .where('email', '==', email))
      .snapshotChanges()
      .pipe(map(actions => actions.map(action => {
        const data = action.payload.doc.data() as InvitationResponse;
        const id = action.payload.doc.id;
        const responseDate = (data.responseDate as unknown as firestore.Timestamp).toDate();
        return { ...data, id, responseDate };
      })));
  }

  getAllInvitationResponses(meetingId: string) {
    return this.db.collection('invitationResponses', ref => ref.where('meetingId', '==', meetingId))
      .snapshotChanges()
      .pipe(map(actions => actions.map(action => {
        const data = action.payload.doc.data() as InvitationResponse;
        const id = action.payload.doc.id;
        const responseDate = (data.responseDate as unknown as firestore.Timestamp).toDate();
        return { ...data, id, responseDate };
      })));
  }

  getInvitationResponseForEachMeeting(meetingIds: string[], email: string) {
    const list = [];
    for (const meetingId of meetingIds) {
      list.push(this.getInvitationResponse(meetingId, email));
    }
    return merge(...list);
  }

  getCommentsByMeetingId(meetingId: string) {
    return this.db.collection('comments', ref => ref.where('meetingId', '==', meetingId).orderBy('lastUpdated', 'desc'))
      .snapshotChanges()
      .pipe(map(actions => actions.map(action => {
        const data = action.payload.doc.data() as Comment;
        const id = action.payload.doc.id;
        const lastUpdated = (data.lastUpdated as unknown as firestore.Timestamp).toDate();
        return { ...data, id, lastUpdated };
      })));
  }

  getActions(actionFilter: ActionFilter) {
    return this.db.collection('actions', ref => {
      let query =  ref.orderBy('dueDate');
      if (actionFilter.companyId) { query = query.where('companyId', '==', actionFilter.companyId); }
      if (actionFilter.actionBy) { query = query.where('actionBy', '==', actionFilter.actionBy); }
      if (actionFilter.followupBy) { query = query.where('followupBy', '==', actionFilter.followupBy); }
      if (actionFilter.from) { query = query.where('dueDate', '>=', actionFilter.from); }
      if (actionFilter.to) { query = query.where('dueDate', '<=', actionFilter.to); }
      return query;
    })
    .snapshotChanges()
    .pipe(map(actions => actions.map(action => {
      const data = action.payload.doc.data() as Action;
      const id = action.payload.doc.id;
      const dueDate = (data.dueDate as unknown as firestore.Timestamp).toDate();
      const lastUpdated = (data.lastUpdated as unknown as firestore.Timestamp).toDate();
      return { ...data, id, dueDate, lastUpdated };
    })));
  }
}
