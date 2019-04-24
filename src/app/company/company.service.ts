import { Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

import { Employee } from './models/employee.model';
import { Company } from './models/company.model';
import { JoinRequest } from './models/join-request.model';
import { Location } from './models/location.model';
import { MeetingRoom } from './models/meeting-room.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private db: AngularFirestore) { }

  createCompany(company: Company): Promise<string> {
    company.id = this.db.createId();
    return this.db.collection('companies').doc(company.id).set(company)
    .then(() => {
      return Promise.resolve(company.id);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Company not created');
    });
  }

  updateCompany(company: Company): Promise<string> {
    return this.db.collection('companies').doc(company.id).set(company)
    .then(() => {
      return Promise.resolve(company.id);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Company not updated');
    });
  }

  createJoinRequest(joinRequest: JoinRequest): Promise<string> {
    joinRequest.id = this.db.createId();
    return this.db.collection('joinRequests').doc(joinRequest.id).set(joinRequest)
    .then(() => {
      return Promise.resolve(joinRequest.id);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Join Request not sent');
    });
  }

  createEmployee(employee: Employee): Promise<string> {
    return this.db.collection('employees').doc(employee.id).set(employee)
    .then(() => {
      return Promise.resolve(employee.id);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Company employee record not created');
    });
  }


  deleteCompany(companyId: string): Promise<boolean> {
    return this.db.collection('companies').doc(companyId).delete()
    .then(() => {
      return Promise.resolve(true);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Company not deleted');
    });
  }

  deleteJoinRequest(joinRequestId: string): Promise<boolean> {
    return this.db.collection('joinRequests').doc(joinRequestId).delete()
    .then(() => {
      return Promise.resolve(true);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Join Request not deleted');
    });
  }

  deleteEmployee(employeeId: string): Promise<boolean> {
    return this.db.collection('employees').doc(employeeId).delete()
    .then(() => {
      return Promise.resolve(true);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Company employee record not deleted');
    });
  }

  getCompany(companyId: string) {
    return this.db.doc<Company>(`companies/${companyId}`).valueChanges()
    .pipe(map(data => {
      if (data) {
        const id = companyId;
        return { ...data, id };
      } else {
        return data;
      }
    }));
  }
  getCompanies() {
    return this.db.collection('companies')
      .snapshotChanges()
      .pipe(map(actions => actions.map(action => {
        const data = action.payload.doc.data() as Company;
        const id = action.payload.doc.id;
        return { ...data, id };
      })));
  }
  getJoinRequestsByInvitedUserEmail(email: string) {
    return this.db.collection('joinRequests', ref => ref.where('email', '==', email))
      .snapshotChanges()
      .pipe(map(actions => actions.map(action => {
        const data = action.payload.doc.data() as JoinRequest;
        const id = action.payload.doc.id;
        return { ...data, id };
      })));
  }

  getJoinRequestsByCompanyId(companyId: string, companyJoinRequestIds: string[]) {
    return this.db.collection('joinRequests', ref => ref.where('companyId', '==', companyId))
      .snapshotChanges()
      .pipe(map(actions => actions.map(action => {
        const data = action.payload.doc.data() as JoinRequest;
        const id = action.payload.doc.id;
        return { ...data, id };
      }).filter(joinRequest => !companyJoinRequestIds.includes(joinRequest.id))));
  }

  getEmployee(employeeId: string) {
    return this.db.doc<Employee>(`employees/${employeeId}`)
    .valueChanges()
    .pipe(map(data => {
      if (data) {
        const id = employeeId;
        return { ...data, id };
      } else {
        return data;
      }
    }));
  }

  getEmployees(employeeIds: string[]) {
    const list = [];
    for (const employeeId of employeeIds) {
      list.push(this.getEmployee(employeeId));
    }
    return merge(...list);
  }

  getEmployeesByCompanyId(companyId: string) {
    return this.db.collection('employees', ref => ref.where('companyId', '==', companyId))
      .snapshotChanges()
      .pipe(map(actions => actions.map(action => {
        const data = action.payload.doc.data() as Employee;
        const id = action.payload.doc.id;
        return { ...data, id };
      })));
  }

  getLocationsByCompanyId(companyId: string) {
    return this.db.collection('locations', ref => ref.where('companyId', '==', companyId))
      .snapshotChanges()
      .pipe(map(actions => actions.map(action => {
        const data = action.payload.doc.data() as Location;
        const id = action.payload.doc.id;
        return { ...data, id };
      })));
  }

  getMeetingRoomsByCompanyId(companyId: string) {
    return this.db.collection('meetingRooms', ref => ref.where('companyId', '==', companyId))
      .snapshotChanges()
      .pipe(map(actions => actions.map(action => {
        const data = action.payload.doc.data() as MeetingRoom;
        const id = action.payload.doc.id;
        return { ...data, id };
      })));
  }

  getEmployeeByJoinRequestId(joinRequestId: string) {
    return this.db.collection('employees', ref => ref.where('joinRequestId', '==', joinRequestId))
      .snapshotChanges()
      .pipe(map(actions => actions.map(action => {
        const data = action.payload.doc.data() as Employee;
        const id = action.payload.doc.id;
        return { ...data, id };
      })),
      map(actions => {
        if (actions) {
          return actions[0];
        } else {
          return undefined;
        }
      }));
  }

  createLocation(location: Location): Promise<string> {
    location.id = this.db.createId();
    return this.db.collection('locations').doc(location.id).set(location)
    .then(() => {
      return Promise.resolve(location.id);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Location not created');
    });
  }

  updateLocation(location: Location): Promise<string> {
    return this.db.collection('locations').doc(location.id).set(location)
    .then(() => {
      return Promise.resolve(location.id);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Location not updated');
    });
  }

  deleteLocation(locationId: string): Promise<boolean> {
    return this.db.collection('locations').doc(locationId).delete()
    .then(() => {
      return Promise.resolve(true);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Location not deleted');
    });
  }

  createMeetingRoom(meetingRoom: MeetingRoom): Promise<string> {
    meetingRoom.id = this.db.createId();
    return this.db.collection('meetingRooms').doc(meetingRoom.id).set(meetingRoom)
    .then(() => {
      return Promise.resolve(meetingRoom.id);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Meeting room not created');
    });
  }

  updateMeetingRoom(meetingRoom: MeetingRoom): Promise<string> {
    return this.db.collection('meetingRooms').doc(meetingRoom.id).set(meetingRoom)
    .then(() => {
      return Promise.resolve(meetingRoom.id);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Meeting room not updated');
    });
  }

  deleteMeetingRoom(meetingRoomId: string): Promise<boolean> {
    return this.db.collection('meetingRooms').doc(meetingRoomId).delete()
    .then(() => {
      return Promise.resolve(true);
    })
    .catch(error => {
      console.log(error);
      throw new Error('Oops! Meeting room not deleted');
    });
  }

}
