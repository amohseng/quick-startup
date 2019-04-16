import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

export enum CalendarView {
  Day = 'DAY',
  Week = 'WEEK',
  Month = 'MONTH'
}

export enum CalendarHeaderSize {
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

  @Input() calendarDate: Date;
  @Input() view: CalendarView = CalendarView.Week;
  @Input() disabled: boolean;
  @Output() dateChanged = new EventEmitter<Date>();
  constructor() { }

  ngOnInit() {
  }

  getMonthName(monthNumber: number, size) {
    let monthName = this.monthNames[monthNumber].long;
    if (size === CalendarHeaderSize.XS) {
      monthName = this.monthNames[monthNumber].short;
    }
    return monthName;
  }

  getDateRangeText(size) {
    let dateRangeText = '';
    if (this.view.toUpperCase() === CalendarView.Day) {
      dateRangeText =
      `${this.getMonthName(this.calendarDate.getMonth(), size)} ${this.calendarDate.getDate()}, ${this.calendarDate.getFullYear()}`;
    } else if (this.view.toUpperCase() === CalendarView.Week) {
      const startDate = this.getDayOfWeekDate(this.calendarDate, 0);
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const startDay = startDate.getDate();

      const endDate = this.getDayOfWeekDate(this.calendarDate, 6);
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth();
      const endDay = endDate.getDate();

      if (startMonth === endMonth) {
        dateRangeText = `${this.getMonthName(startMonth, size)} ${startDay} - ${endDay}, ${endYear}`;
      } else if (startMonth !== endMonth && startYear === endYear) {
        dateRangeText = `${this.getMonthName(startMonth, size)} ${startDay} - ${this.getMonthName(endMonth, size)} ${endDay}, ${endYear}`;
      } else if (startMonth !== endMonth && startYear !== endYear) {
        dateRangeText =
        `${this.getMonthName(startMonth, size)} ${startDay}, ${startYear} - ${this.getMonthName(endMonth, size)} ${endDay}, ${endYear}`;
      }
    } else if (this.view.toUpperCase() === CalendarView.Month) {
      dateRangeText =
      `${this.getMonthName(this.calendarDate.getMonth(), size)}, ${this.calendarDate.getFullYear()}`;
    }
    return dateRangeText;
  }

  getDayOfWeekDate(anydate: Date, weekdayNumber: number) {
    const weekdayDate = new Date(anydate);
    weekdayDate.setDate(weekdayDate.getDate() - weekdayDate.getDay() + weekdayNumber);
    weekdayDate.setHours(0);
    weekdayDate.setMinutes(0);
    weekdayDate.setSeconds(0);
    return weekdayDate;
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
