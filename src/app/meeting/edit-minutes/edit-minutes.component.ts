import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { MeetingService } from '../meeting.service';
import { CompanyService } from 'src/app/company/company.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UIService } from 'src/app/util/ui.service';
import { DateService } from 'src/app/util/date.service';

import { ProfileData } from 'src/app/auth/models/profile-data.model';
import { Meeting } from '../models/meeting.model';
import { Minutes } from '../models/minutes.model';
import { Employee } from 'src/app/company/models/employee.model';
import { Company } from 'src/app/company/models/company.model';

@Component({
  selector: 'app-edit-minutes',
  templateUrl: './edit-minutes.component.html',
  styleUrls: ['./edit-minutes.component.css']
})
export class EditMinutesComponent implements OnInit, OnDestroy {
  newItemActionByDefaultValue = 'none';
  newItemDueDateDefaultValue = new Date();
  newItemFollowupByDefaultValue = 'none';
  isLoading = false;
  isWriting = false;
  email = '';
  profileData: ProfileData;
  meetingId = '';
  meeting: Meeting;
  employees: Employee[] = [];
  companies: Company[];
  allMinutesRevisions: Minutes[] = [];
  minutes: Minutes;
  editMinutesLine = null;
  openTopicItems = null;

  totalResourcesToFetch = 4;
  fetchedResources = 0;
  meetingSubscription: Subscription;
  employeesSubscription: Subscription;
  companiesSubscription: Subscription;
  minutesSubscription: Subscription;

  @ViewChild('newTopicRef') newTopicRef: ElementRef;
  @ViewChild('updateTopicRef') updateTopicRef: ElementRef;
  @ViewChild('newItemRef') newItemRef: ElementRef;
  @ViewChild('updateItemRef') updateItemRef: ElementRef;

  constructor(private meetingService: MeetingService, private companyService: CompanyService,
    private authService: AuthService, private uiService: UIService, public ds: DateService,
    private router: Router, private route: ActivatedRoute, public dialog: MatDialog, private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this.isLoading = true;
    this.email = this.authService.getEmail();
    this.profileData = this.authService.getProfile();
    this.route.params.subscribe((params: Params) => {
      this.meetingId = params['id'];
      if (this.meetingId !== null) {
        this.getMeeting();
      } else {
        this.uiService.showSnackBar('Oops, meeting not identified', null, 3000);
        this.router.navigate(['/']);
      }
    });
  }

  getMeeting() {
    if (this.meetingSubscription) {
      this.meetingSubscription.unsubscribe();
    }
    this.meetingSubscription = this.meetingService.getMeetingById(this.meetingId).pipe(take(1)).subscribe(meeting => {
      if (meeting) {
        this.meeting = meeting;
        this.fetchedResources += 1;
        this.getMinutes();
        this.getEmployees();
        this.getCompanies();
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

  getMinutes() {
    if (this.minutesSubscription) {
      this.minutesSubscription.unsubscribe();
    }
    this.minutesSubscription = this.meetingService.getMinutesByMeetingId(this.meetingId).pipe(take(1)).subscribe(allMinutesRevisions => {
      this.allMinutesRevisions = allMinutesRevisions;
      if (this.allMinutesRevisions.length < 1) {
        this.setNewMinutes();
      } else {
        this.minutes = this.allMinutesRevisions[this.allMinutesRevisions.length - 1];
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

  setNewMinutes() {
    this.minutes = {
      id: null,
      meetingId: this.meeting.id,
      companyId: this.meeting.companyId,
      companyEmail: this.meeting.companyEmail,
      topics: [],
      attendance: [],
      lastUpdated: null,
      lastUpdatedBy: null
    };
  }

  getEmployees() {
    let counter = 0;
    if (this.employeesSubscription) {
      this.employeesSubscription.unsubscribe();
    }
    this.employeesSubscription = this.companyService.getEmployees(this.meeting.invitations)
    .subscribe((employee: Employee) => {
      if (employee) {
        this.employees.push(employee);
      }
      counter++;
      if (counter === this.meeting.invitations.length) {
        this.fetchedResources += 1;
        if (this.fetchedResources >= this.totalResourcesToFetch) {
          this.isLoading = false;
        }
      }
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
      this.router.navigate(['/']);
    });
  }

  getCompanies() {
    if (this.companiesSubscription) {
      this.companiesSubscription.unsubscribe();
    }
    this.companiesSubscription = this.companyService.getCompanies().pipe(take(1)).subscribe(companies => {
      this.companies = companies;
      this.fetchedResources += 1;
      if (this.fetchedResources >= this.totalResourcesToFetch) {
        this.isLoading = false;
      }
    },
    error => {
      console.log(error);
      this.isLoading = false;
      this.uiService.showSnackBar(error, null, 3000);
    });
  }

  toggleAttendance(invitation: string) {
    const index = this.minutes.attendance.indexOf(invitation);
    if (index < 0) {
      this.minutes.attendance.push(invitation);
    } else {
      this.minutes.attendance.splice(index, 1);
    }
  }

  checkAttendance(invitation: string) {
    let attendance = false;
    const index = this.minutes.attendance.indexOf(invitation);
    if (index >= 0) {
      attendance = true;
    }
    return attendance;
  }

  getDisplayName(invitation: string) {
    let displayName = invitation;
    const employee = this.employees.find((emp => {
      return emp.id === invitation;
    }));

    if (employee) {
      displayName = employee.displayName + ' (' + this.getCompanyById(employee.companyId).name + ')';
    }
    return displayName;
  }

  getCompanyById(companyId: string) {
    return this.companies.find((company => {
      return company.id === companyId;
    }));
  }

  async saveMinutes() {
    this.isWriting = true;
    try {
      this.minutes.lastUpdated = new Date();
      this.minutes.lastUpdatedBy = this.email;
      const minutesId = await this.meetingService.saveMinutes(this.minutes);
      this.uiService.showSnackBar('Minutes saved successfully!', null, 3000);
      this.isWriting = false;
      this.router.navigate(['../'], {relativeTo: this.route});
    } catch (error) {
      console.log(error);
      this.uiService.showSnackBar(error, null, 3000);
    }
  }

  cancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  editTopic(topicId: string) {
    this.editMinutesLine = topicId;
    this.changeDetector.detectChanges();
    this.updateTopicRef.nativeElement.focus();
  }

  editItem(itemId: string) {
    this.editMinutesLine = itemId;
    this.changeDetector.detectChanges();
    this.updateItemRef.nativeElement.focus();
  }

  toggleOpenTopicItems(topicId: string) {
    if (this.openTopicItems === topicId) {
      this.openTopicItems = null;
    } else {
      this.openTopicItems = topicId;
    }
  }

  addTopic(newTopicInput: FormControl) {
    if (newTopicInput.valid) {
      this.minutes.topics.push({
        id: this.meetingService.getDBId(),
        description: newTopicInput.value,
        items: []
      });
    }
    newTopicInput.reset();
    this.newTopicRef.nativeElement.focus();
  }

  addItem(topicId: string, newItemInput: FormControl, newItemActionBySelect: FormControl,
    newItemDueDateInput: FormControl, newItemFollowupBySelect: FormControl) {
    const topicIndex = this.minutes.topics.findIndex((topic) => {
      return topic.id === topicId;
    });
    if (topicIndex >= 0 && newItemInput.valid && newItemActionBySelect.valid &&
        newItemDueDateInput.valid && newItemFollowupBySelect.valid) {
      this.minutes.topics[topicIndex].items.push({
        id: this.meetingService.getDBId(),
        description: newItemInput.value,
        actionBy: newItemActionBySelect.value,
        dueDate: new Date(newItemDueDateInput.value),
        followupBy: newItemActionBySelect.value === 'none' ? 'none' : newItemFollowupBySelect.value
      });
    }
    newItemInput.reset();
    newItemActionBySelect.reset(this.newItemActionByDefaultValue);
    newItemDueDateInput.reset(this.newItemDueDateDefaultValue);
    newItemFollowupBySelect.reset(this.newItemFollowupByDefaultValue);
    this.newItemRef.nativeElement.focus();
  }

  onNewTopicInputBlur(newTopicInput: FormControl) {
    if (!newTopicInput.valid) {
      newTopicInput.reset();
    }
  }

  onNewItemInputBlur(newItemInput: FormControl) {
    if (!newItemInput.valid) {
      newItemInput.reset();
    }
  }

  onNewTopicInputKeyPress(e, newTopicInput: FormControl) {
    if (e.keyCode === 13) {
      this.addTopic(newTopicInput);
    }
  }

  updateTopic(topicId: string, updateTopicInput: FormControl) {
    if (updateTopicInput.valid) {
      const index = this.minutes.topics.findIndex((topic) => {
        return topic.id === topicId;
      });
      if (index >= 0) {
        this.minutes.topics[index].description = updateTopicInput.value;
      }
    }
    this.editMinutesLine = null;
  }

  updateItem(topicId: string, itemId: string, updateItemInput: FormControl,
    updateItemActionBySelect: FormControl, updateItemDueDateInput: FormControl, updateItemFollowupBySelect: FormControl) {
    if (updateItemInput.valid && updateItemActionBySelect.valid && updateItemDueDateInput.valid && updateItemFollowupBySelect.valid) {
      const topicIndex = this.minutes.topics.findIndex((topic) => {
        return topic.id === topicId;
      });
      if (topicIndex >= 0) {
        const itemIndex = this.minutes.topics[topicIndex].items.findIndex((item) => {
          return item.id === itemId;
        });
        if (itemIndex >= 0) {
          this.minutes.topics[topicIndex].items[itemIndex].description = updateItemInput.value;
          this.minutes.topics[topicIndex].items[itemIndex].actionBy = updateItemActionBySelect.value;
          this.minutes.topics[topicIndex].items[itemIndex].dueDate = new Date(updateItemDueDateInput.value);
          this.minutes.topics[topicIndex]
                      .items[itemIndex].followupBy = updateItemActionBySelect.value === 'none' ? 'none' : updateItemFollowupBySelect.value;
        }
      }
    }
    this.editMinutesLine = null;
  }

  onUpdateTopicInputKeyPress(e, topicId: string, newTopicInput: FormControl) {
    if (e.keyCode === 13) {
      this.updateTopic(topicId, newTopicInput);
    }
  }

  deleteTopic(topicId: string) {
    const index = this.minutes.topics.findIndex((topic) => {
      return topic.id === topicId;
    });
    if (index >= 0) {
      this.minutes.topics.splice(index, 1);
    }
  }

  deleteItem(topicId: string, itemId: string) {
    const topicIndex = this.minutes.topics.findIndex((topic) => {
      return topic.id === topicId;
    });
    if (topicIndex >= 0) {
      const itemIndex = this.minutes.topics[topicIndex].items.findIndex((item) => {
        return item.id === itemId;
      });
      if (itemIndex >= 0) {
        this.minutes.topics[topicIndex].items.splice(itemIndex, 1);
      }
    }
  }

  topicMoveUp(topicIndex: number) {
    if (topicIndex > 0) {
      const newIndex = topicIndex - 1;
      this.minutes.topics = this.lineMove([...this.minutes.topics], topicIndex, newIndex);
    }
  }

  itemMoveUp(topicIndex: number, itemIndex: number) {
    if (itemIndex > 0) {
      const newIndex = itemIndex - 1;
      this.minutes.topics[topicIndex].items = this.lineMove([...this.minutes.topics[topicIndex].items], itemIndex, newIndex);
    }
  }

  topicMoveDown(topicIndex: number) {
    if (topicIndex < this.minutes.topics.length - 1) {
      const newIndex = topicIndex + 1;
      this.minutes.topics = this.lineMove([...this.minutes.topics], topicIndex, newIndex);
    }
  }

  itemMoveDown(topicIndex: number, itemIndex: number) {
    if (itemIndex < this.minutes.topics[topicIndex].items.length - 1) {
      const newIndex = itemIndex + 1;
      this.minutes.topics[topicIndex].items = this.lineMove([...this.minutes.topics[topicIndex].items], itemIndex, newIndex);
    }
  }

  lineMove(arr, old_index, new_index) {
    while (old_index < 0) {
        old_index += arr.length;
    }
    while (new_index < 0) {
        new_index += arr.length;
    }
    if (new_index >= arr.length) {
        let k = new_index - arr.length;
        while ((k--) + 1) {
            arr.push(undefined);
        }
    }
     arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
   return arr;
  }


  ngOnDestroy() {
    if (this.meetingSubscription) {
      this.meetingSubscription.unsubscribe();
    }
    if (this.minutesSubscription) {
      this.minutesSubscription.unsubscribe();
    }
    if (this.employeesSubscription) {
      this.employeesSubscription.unsubscribe();
    }
    if (this.companiesSubscription) {
      this.companiesSubscription.unsubscribe();
    }
  }

}
