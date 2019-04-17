import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DateService } from 'src/app/util/date.service';

export enum CalendarView {
  Day = 'DAY',
  Week = 'WEEK',
  Month = 'MONTH'
}

export enum CalendarSize {
  XS = 'XS',
  SM = 'SM',
  MD = 'MD',
  LG = 'LG'
}

@Component({
  selector: 'app-calendar-header',
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.css']
})
export class CalendarHeaderComponent implements OnInit {
  calendarSize = CalendarSize;
  @Input() calendarDate: Date;
  @Input() view: CalendarView = CalendarView.Week;
  @Input() disabled: boolean;
  @Output() dateChanged = new EventEmitter<Date>();
  constructor(public ds: DateService) { }

  ngOnInit() {
  }

  getMonthName(anydate: Date, size) {
    const weekdayDate = new Date(anydate);
    let monthName;
    if (size === CalendarSize.XS) {
      monthName = this.ds.getMonthShortName(weekdayDate);
    } else {
      monthName = this.ds.getMonthLongName(weekdayDate);
    }
    return monthName;
  }

  getDateRangeText(size) {
    let dateRangeText = '';
    if (this.view.toUpperCase() === CalendarView.Day) {
      dateRangeText =
      `${this.ds.getMonthLongName(this.calendarDate)} ${this.calendarDate.getDate()}, ${this.calendarDate.getFullYear()}`;
    } else if (this.view.toUpperCase() === CalendarView.Week) {
      const startDate = this.ds.getDayOfWeekDate(this.calendarDate, 0);
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const startDay = startDate.getDate();

      const endDate = this.ds.getDayOfWeekDate(this.calendarDate, 6);
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth();
      const endDay = endDate.getDate();

      if (startMonth === endMonth) {
        dateRangeText = `${this.getMonthName(startDate, size)} ${startDay} - ${endDay}, ${endYear}`;
      } else if (startMonth !== endMonth && startYear === endYear) {
        dateRangeText = `${this.getMonthName(startDate, size)} ${startDay} - ${this.getMonthName(endDate, size)} ${endDay}, ${endYear}`;
      } else if (startMonth !== endMonth && startYear !== endYear) {
        dateRangeText =
        `${this.getMonthName(startDate, size)} ${startDay}, ${startYear} - ${this.getMonthName(endDate, size)} ${endDay}, ${endYear}`;
      }
    } else if (this.view.toUpperCase() === CalendarView.Month) {
      dateRangeText =
      `${this.ds.getMonthLongName(this.calendarDate)}, ${this.calendarDate.getFullYear()}`;
    }
    return dateRangeText;
  }

  getNextDate(anydate: Date) {
    const weekdayDate = new Date(anydate);
    if (this.view.toUpperCase() === CalendarView.Day) {
      weekdayDate.setDate(weekdayDate.getDate() + 1);
    } else if (this.view.toUpperCase() === CalendarView.Week) {
      weekdayDate.setDate(weekdayDate.getDate() + 7);
    } else if (this.view.toUpperCase() === CalendarView.Month) {
      weekdayDate.setMonth(weekdayDate.getMonth() + 1);
    }
    weekdayDate.setHours(0);
    weekdayDate.setMinutes(0);
    weekdayDate.setSeconds(0);
    weekdayDate.setMilliseconds(0);
    return weekdayDate;
  }

  getPreviousDate(anydate: Date) {
    const weekdayDate = new Date(anydate);
    if (this.view.toUpperCase() === CalendarView.Day) {
      weekdayDate.setDate(weekdayDate.getDate() - 1);
    } else if (this.view.toUpperCase() === CalendarView.Week) {
      weekdayDate.setDate(weekdayDate.getDate() - 7);
    } else if (this.view.toUpperCase() === CalendarView.Month) {
      weekdayDate.setMonth(weekdayDate.getMonth() - 1);
    }
    weekdayDate.setHours(0);
    weekdayDate.setMinutes(0);
    weekdayDate.setSeconds(0);
    weekdayDate.setMilliseconds(0);
    return weekdayDate;
  }

  onNextClicked() {
    this.calendarDate = this.getNextDate(this.calendarDate);
    this.dateChanged.emit( this.calendarDate);
  }

  onPreviousClicked() {
    this.calendarDate = this.getPreviousDate(this.calendarDate);
    this.dateChanged.emit( this.calendarDate);
  }

  onTodayClicked() {
    this.calendarDate = new Date();
    this.dateChanged.emit(this.calendarDate);
  }
}
