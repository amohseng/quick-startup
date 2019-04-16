import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Meeting } from '../../models/meeting.model';

export enum CalendarSize {
  XS = 'XS',
  SM = 'SM',
  MD = 'MD',
  LG = 'LG'
}
export enum AttendeeResponse {
  Accepted = 'ACCEPTED',
  Declined = 'DECLINED',
  Pending = 'PENDING'
}

@Component({
  selector: 'app-calendar-day-view',
  templateUrl: './calendar-day-view.component.html',
  styleUrls: ['./calendar-day-view.component.css']
})
export class CalendarDayViewComponent implements OnInit, OnChanges {
  calendarSize = CalendarSize;
  attendeeResponse = AttendeeResponse;
  weekdayNames = [
    {short: 'SUN', long: 'Sunday'},
    {short: 'MON', long: 'Monday'},
    {short: 'TUE', long: 'Tuesday'},
    {short: 'WED', long: 'Wednesday'},
    {short: 'THU', long: 'Thursday'},
    {short: 'FRI', long: 'Friday'},
    {short: 'SAT', long: 'Saturday'},
  ];
  monthNames = [
    {short: 'JAN', long: 'January'},
    {short: 'FEB', long: 'February'},
    {short: 'MAR', long: 'March'},
    {short: 'APR', long: 'April'},
    {short: 'MAY', long: 'May'},
    {short: 'JUN', long: 'June'},
    {short: 'JUL', long: 'July'},
    {short: 'AUG', long: 'August'},
    {short: 'SEP', long: 'September'},
    {short: 'OCT', long: 'October'},
    {short: 'NOV', long: 'November'},
    {short: 'DEC', long: 'December'},
  ];
  hours = ['0', '1 AM', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
           '12 PM', '1' , '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

  @Input() anydate: Date;
  @Input() meetings: Meeting[];
  @Input() clickable: boolean;
  @Input() isLoading: boolean;
  @Input() attendeeResponseMap: Map<string, string>;
  @Output() meetingClicked = new EventEmitter<Meeting>();

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.meetings) {
      this.detectConflicts(this.meetings);
    }
  }

  onMeetingClicked(meeting: Meeting) {
    if (this.clickable) {
      this.meetingClicked.emit(meeting);
    }
  }

  hasConflict(meetingOne: Meeting, meetingTwo: Meeting) {
    let result = false;
    if (meetingOne.start.getTime() >= meetingTwo.start.getTime() && meetingOne.end.getTime() <= meetingTwo.end.getTime()) {
      result = true;
    }

    if (meetingOne.start.getTime() <= meetingTwo.start.getTime() && meetingOne.end.getTime() >= meetingTwo.end.getTime()) {
      result = true;
    }

    if (meetingOne.start.getTime() < meetingTwo.start.getTime() && meetingOne.end.getTime() > meetingTwo.start.getTime()) {
      result = true;
    }

    if (meetingOne.start.getTime() < meetingTwo.end.getTime() && meetingOne.end.getTime() > meetingTwo.end.getTime()) {
      result = true;
    }
    return result;
  }

  setConflictIfExist(meeting1: Meeting, meeting2: Meeting) {
    if (meeting1.id !==  meeting2.id && this.hasConflict(meeting1, meeting2)) {
      const childFound = meeting1.childConflicts.find((meeting) => {
        return meeting === meeting2;
      });
      if (!childFound) {
        meeting1.childConflicts.push(meeting2);
        const parentFound = meeting2.parentConflicts.find((meeting) => {
          return meeting === meeting1;
        });
        if (!parentFound) {
          meeting2.parentConflicts.push(meeting1);
        }
      }
    }
  }

  detectConflicts(meetingsArr: Meeting[]) {
    for (let i = 0; i < meetingsArr.length; i++) {
      meetingsArr[i].parentConflicts = [];
      meetingsArr[i].childConflicts = [];
    }
    for (let i = 0; i < meetingsArr.length - 1; i++) {
      for (let j = i + 1; j < meetingsArr.length; j++) {
        this.setConflictIfExist(meetingsArr[i], meetingsArr[j]);
      }
    }
  }

  getChildLongestPath(meeting: Meeting) {
    const longestPathArr: number[] = [];
    this.countChildLongestPathRecursive(0, longestPathArr, meeting);
    return Math.max(...longestPathArr);
  }

  countChildLongestPathRecursive(level: number, longestPathArr: number[], meeting: Meeting) {
    longestPathArr.push(level);
    if (meeting.childConflicts.length > 0) {
      level += 1;
      for (let i = 0; i < meeting.childConflicts.length; i++) {
        this.countChildLongestPathRecursive(level, longestPathArr, meeting.childConflicts[i]);
      }
    }
  }

  getParentLongestPath(meeting: Meeting) {
    const longestPathArr: number[] = [];
    this.countParentLongestPathRecursive(0, longestPathArr, meeting);
    return Math.max(...longestPathArr);
  }
  countParentLongestPathRecursive(level: number, longestPathArr: number[], meeting: Meeting) {
    longestPathArr.push(level);
    if (meeting.parentConflicts.length > 0) {
      level += 1;
      for (let i = 0; i < meeting.parentConflicts.length; i++) {
        this.countParentLongestPathRecursive(level, longestPathArr, meeting.parentConflicts[i]);
      }
    }
  }

  getMonthName(anydate: Date, size) {
    const weekdayDate = new Date(anydate);
    let monthName = this.monthNames[weekdayDate.getMonth()].long;
    if (size === CalendarSize.XS) {
      monthName = this.monthNames[weekdayDate.getMonth()].short;
    }
    return monthName;
  }

  getWeekYear(anydate: Date) {
    const lastDayDate = this.getDayOfWeekDate(anydate, 6);
    return lastDayDate.getFullYear();
  }

  getWeekNumber(anydate: Date) {
    let weekNumber = 1;
    const lastDayDate = this.getDayOfWeekDate(anydate, 6);
    const oneJan = new Date(lastDayDate.getFullYear(), 0, 1);
    const passedDays = Math.floor((lastDayDate.getTime() - oneJan.getTime()) / 86400000);
    weekNumber = Math.ceil((passedDays + oneJan.getDay() + 1) / 7);
    return (weekNumber < 10 ? '0' : '') + weekNumber;
  }

  getDayOfWeekDate(anydate: Date, weekdayNumber: number) {
    const weekdayDate = new Date(anydate);
    weekdayDate.setDate(weekdayDate.getDate() - weekdayDate.getDay() + weekdayNumber);
    weekdayDate.setHours(0);
    weekdayDate.setMinutes(0);
    weekdayDate.setSeconds(0);
    return weekdayDate;
  }

  getEndOfDayDate(anydate: Date) {
    const endofdayDate = new Date(anydate);
    endofdayDate.setHours(23);
    endofdayDate.setMinutes(59);
    endofdayDate.setSeconds(59);
    return endofdayDate;
  }

  getPrimaryColor() {
    return '#388E3C';
  }
  getPrimaryLightColor() {
    return '#A5D6A7';
  }
  getPrimaryDarkColor() {
    return '#1B5E20';
  }
  getAccentColor() {
    return '#FFCC80';
  }
  getAccentDarkColor() {
    return '#FFA726';
  }
  getAccentLightColor() {
    return '#FFE0B2';
  }

  getWarnColor() {
    return 'red';
  }
  getWarnDarkColor() {
    return 'darkred';
  }
  getWarnLightColor() {
    return 'pink';
  }

  getDisabledLightColor() {
    return 'lightgrey';
  }
  getDisabledDarkColor() {
    return 'black';
  }

  getCellWidth(size) {
    let width = 40;
    if (size === CalendarSize.SM) {
      width = 80;
    } else if (size === CalendarSize.MD) {
      width = 120;
    } else if (size === CalendarSize.LG) {
      width = 150;
    }
    return width;
  }
  getSideCellWidth(size) {
    return 20;
  }

  getMeetingCellWidth(meeting: Meeting, size, widthMargin: number) {
    return ((this.getCellWidth(size) * 7) - 2 * widthMargin - 1) /
            (this.getChildLongestPath(meeting) + this.getParentLongestPath(meeting) + 1);
  }

  getCellHeight(size) {
    return 36;
  }

  getHeaderCellHeight(size) {
    return 24;
  }

  getCalendarWeekViewStyle(size) {
    return {
      ['box-sizing'] : 'border-box',
      ['width'] : (8 * this.getCellWidth(size)).toString() + 'px',
      ['height']: (24 * this.getCellHeight(size) + (2 * this.getHeaderCellHeight(size))).toString() + 'px',
      ['position'] : 'relative',
    };
  }

  getLoadingStyle(size) {
    return {
      ['box-sizing'] : 'border-box',
      ['width'] : (8 * this.getCellWidth(size)).toString() + 'px',
      ['height']: (24 * this.getCellHeight(size) + (2 * this.getHeaderCellHeight(size))).toString() + 'px',
      ['position'] : 'absolute',
      ['z-index']: 200,
      ['top'] : '0px',
      ['left'] : '0px',
      ['background-color'] : this.getDisabledLightColor(),
      ['color'] : this.getDisabledDarkColor(),
      ['display'] : 'flex',
      ['align-items'] : 'center',
      ['justify-content'] : 'center',
      ['opacity']:  '0.5'
    };
  }

  getTopCornerCellOneStyle(size) {
    return {
      ['box-sizing'] : 'border-box',
      ['width'] : this.getCellWidth(size).toString() + 'px',
      ['height']: this.getHeaderCellHeight(size).toString() + 'px',
      ['position'] : 'absolute',
      ['top'] : '0px',
      ['left'] : '0px',
      ['color'] : this.getPrimaryDarkColor(),
      ['font-weight'] : 'bold',
      ['display'] : 'flex',
      ['align-items'] : 'center',
      ['justify-content'] : 'center',
      ['border-top'] : '1px solid' + this.getAccentDarkColor(),
    };
  }
  getTopCornerCellTwoStyle(size) {
    return {
      ['box-sizing'] : 'border-box',
      ['width'] : this.getCellWidth(size).toString() + 'px',
      ['height']: this.getHeaderCellHeight(size).toString() + 'px',
      ['position'] : 'absolute',
      ['top'] : this.getHeaderCellHeight(size).toString() + 'px',
      ['left'] : '0px',
      ['color'] : this.getPrimaryDarkColor(),
      ['font-weight'] : 'bold',
      ['display'] : 'flex',
      ['align-items'] : 'center',
      ['justify-content'] : 'center',
      ['border-bottom'] : '1px solid' + this.getPrimaryLightColor(),
    };
  }
  getHeaderOneStyle(size) {
    return {
      ['box-sizing'] : 'border-box',
      ['width'] : (this.getCellWidth(size) * 7).toString() + 'px',
      ['height']: this.getHeaderCellHeight(size).toString() + 'px',
      ['position'] : 'absolute',
      ['top'] : '0px',
      ['left'] : this.getCellWidth(size).toString() + 'px',
      ['color'] : this.getPrimaryColor(),
      ['display'] : 'flex',
      ['align-items'] : 'center',
      ['justify-content'] : 'center',
      ['border-top'] : '1px solid' + this.getAccentDarkColor(),
    };
  }
  getHeaderTwoStyle(size) {
    return {
      ['box-sizing'] : 'border-box',
      ['width'] : (this.getCellWidth(size) * 7).toString() + 'px',
      ['height']: this.getHeaderCellHeight(size).toString() + 'px',
      ['position'] : 'absolute',
      ['top'] : this.getHeaderCellHeight(size).toString() + 'px',
      ['left'] : this.getCellWidth(size).toString() + 'px',
      ['color'] : this.getPrimaryColor(),
      ['display'] : 'flex',
      ['align-items'] : 'center',
      ['justify-content'] : 'center',
      ['border-bottom'] : '1px solid' + this.getPrimaryLightColor(),
    };
  }

  getSideStyle(hourNumber: number, size) {
    return {
      ['box-sizing'] : 'border-box',
      ['width'] : this.getSideCellWidth(size).toString() + 'px',
      ['height']: this.getCellHeight(size).toString() + 'px',
      ['position'] : 'absolute',
      ['top'] : (((hourNumber) * this.getCellHeight(size)) + (2 * this.getHeaderCellHeight(size)) - 6).toString() + 'px',
      ['left'] : (this.getCellWidth(size) - this.getSideCellWidth(size)).toString() + 'px',
      ['color'] : this.getPrimaryColor(),
      ['font-weight'] : '300',
      ['font-size'] : '0.75rem',
      ['text-align'] : 'center',
    };
  }
  getHourStyle(hourNumber: number, size) {
    return {
      ['box-sizing'] : 'border-box',
      ['width'] : (this.getCellWidth(size) * 7).toString() + 'px',
      ['height']: this.getCellHeight(size).toString() + 'px',
      ['position'] : 'absolute',
      ['top'] : ((hourNumber * this.getCellHeight(size)) + (2 * this.getHeaderCellHeight(size))).toString() + 'px',
      ['left'] : this.getCellWidth(size).toString() + 'px',
      ['border-left'] : '1px solid' + this.getPrimaryLightColor(),
      ['border-bottom'] : '1px solid' + this.getPrimaryLightColor(),
    };
  }

  getMeetingStyle(meeting: Meeting, size) {
    const startDay = meeting.start.getDay();
    const startHour = meeting.start.getHours() + meeting.start.getMinutes() / 60;
    const duration = (meeting.end.getTime() - meeting.start.getTime()) / (3600000);
    const widthMargin = 1;
    const heightMargin = 1;
    return {
      ['box-sizing'] : 'border-box',
      ['width'] : (this.getMeetingCellWidth(meeting, size, widthMargin)).toString() + 'px',
      ['height']: (duration * this.getCellHeight(size) - heightMargin).toString() + 'px',
      ['position'] : 'absolute',
      ['z-index'] : 100,
      ['top'] : ((startHour * this.getCellHeight(size)) + (2 * this.getHeaderCellHeight(size)) + heightMargin).toString() + 'px',
      ['left'] : (
        (this.getCellWidth(size) + widthMargin) + 1 +
        ((this.getMeetingCellWidth(meeting, size, widthMargin)) * this.getParentLongestPath(meeting))
      ).toString() + 'px',
      ['border-left'] : '6px solid ' + this.getPrimaryColor(),
      ['background-color'] : this.getPrimaryLightColor(),
      ['color'] : this.getPrimaryDarkColor(),
      ['font-size'] : '0.75rem',
      ['padding'] : '2px',
      ['overflow'] : 'hidden',
      ['text-overflow'] : 'ellipsis',
      ['display'] : 'flex',
      ['flex-flow'] : 'column',
      ['cursor'] : this.clickable ? 'pointer' : '',
      ['text-decoration'] : meeting.canceled ? 'line-through' : '',
      ['opacity']: meeting.canceled || this.attendeeResponseMap.get(meeting.id) !== AttendeeResponse.Accepted ? '0.4' : '1'
    };
  }
}
