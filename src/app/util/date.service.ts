import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class DateService {
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

  twelveHoursLabelsEveryHour = ['0', '1 AM', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
           '12 PM', '1' , '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

  twelveHoursEveryHalf = [
    {value: 0, text: '12:00 AM', hours: 0, minutes: 0},
    {value: 0.5, text: '12:30 AM', hours: 0, minutes: 30},
    {value: 1, text: '01:00 AM', hours: 1, minutes: 0},
    {value: 1.5, text: '01:30 AM', hours: 1, minutes: 30},
    {value: 2, text: '02:00 AM', hours: 2, minutes: 0},
    {value: 2.5, text: '02:30 AM', hours: 2, minutes: 30},
    {value: 3, text: '03:00 AM', hours: 3, minutes: 0},
    {value: 3.5, text: '03:30 AM', hours: 3, minutes: 30},
    {value: 4, text: '04:00 AM', hours: 4, minutes: 0},
    {value: 4.5, text: '04:30 AM', hours: 4, minutes: 30},
    {value: 5, text: '05:00 AM', hours: 5, minutes: 0},
    {value: 5.5, text: '05:30 AM', hours: 5, minutes: 30},
    {value: 6, text: '06:00 AM', hours: 6, minutes: 0},
    {value: 6.5, text: '06:30 AM', hours: 6, minutes: 30},
    {value: 7, text: '07:00 AM', hours: 7, minutes: 0},
    {value: 7.5, text: '07:30 AM', hours: 7, minutes: 30},
    {value: 8, text: '08:00 AM', hours: 8, minutes: 0},
    {value: 8.5, text: '08:30 AM', hours: 8, minutes: 30},
    {value: 9, text: '09:00 AM', hours: 9, minutes: 0},
    {value: 9.5, text: '09:30 AM', hours: 9, minutes: 30},
    {value: 10, text: '10:00 AM', hours: 10, minutes: 0},
    {value: 10.5, text: '10:30 AM', hours: 10, minutes: 30},
    {value: 11, text: '11:00 AM', hours: 11, minutes: 0},
    {value: 11.5, text: '11:30 AM', hours: 11, minutes: 30},
    {value: 12, text: '12:00 PM', hours: 12, minutes: 0},
    {value: 12.5, text: '12:30 PM', hours: 12, minutes: 30},
    {value: 13, text: '01:00 PM', hours: 13, minutes: 0},
    {value: 13.5, text: '01:30 PM', hours: 13, minutes: 30},
    {value: 14, text: '02:00 PM', hours: 14, minutes: 0},
    {value: 14.5, text: '02:30 PM', hours: 14, minutes: 30},
    {value: 15, text: '03:00 PM', hours: 15, minutes: 0},
    {value: 15.5, text: '03:30 PM', hours: 15, minutes: 30},
    {value: 16, text: '04:00 PM', hours: 16, minutes: 0},
    {value: 16.5, text: '04:30 PM', hours: 16, minutes: 30},
    {value: 17, text: '05:00 PM', hours: 17, minutes: 0},
    {value: 17.5, text: '05:30 PM', hours: 17, minutes: 30},
    {value: 18, text: '06:00 PM', hours: 18, minutes: 0},
    {value: 18.5, text: '06:30 PM', hours: 18, minutes: 30},
    {value: 19, text: '07:00 PM', hours: 19, minutes: 0},
    {value: 19.5, text: '07:30 PM', hours: 19, minutes: 30},
    {value: 20, text: '08:00 PM', hours: 20, minutes: 0},
    {value: 20.5, text: '08:30 PM', hours: 20, minutes: 30},
    {value: 21, text: '09:00 PM', hours: 21, minutes: 0},
    {value: 21.5, text: '09:30 PM', hours: 21, minutes: 30},
    {value: 22, text: '10:00 PM', hours: 22, minutes: 0},
    {value: 22.5, text: '10:30 PM', hours: 22, minutes: 30},
    {value: 23, text: '11:00 PM', hours: 23, minutes: 0},
    {value: 23.5, text: '11:30 PM', hours: 23, minutes: 30}
  ];

  getMonthShortName(anydate: Date) {
    const weekdayDate = new Date(anydate);
    return this.monthNames[weekdayDate.getMonth()].short;
  }

  getMonthLongName(anydate: Date) {
    const weekdayDate = new Date(anydate);
    return this.monthNames[weekdayDate.getMonth()].long;
  }

  getMonthNames() {
    return [...this.monthNames];
  }

  getWeekdayShortName(weekDayNumber: number) {
    return this.weekdayNames[weekDayNumber].short;
  }

  getWeekdayLongName(weekDayNumber: number) {
    return this.weekdayNames[weekDayNumber].long;
  }

  getWeekdayNames() {
    return [...this.weekdayNames];
  }

  getTwelveHoursLabelsEveryHour() {
    return [...this.twelveHoursLabelsEveryHour];
  }
  getTwelveHoursEveryHalf() {
    return [...this.twelveHoursEveryHalf];
  }

  getFromTwelveHoursEveryHalf(date: Date) {
    return this.twelveHoursEveryHalf.find((hour) => {
      return hour.hours === date.getHours() && hour.minutes === date.getMinutes();
    });
  }

  getDayOfWeekDate(anydate: Date, weekdayNumber: number) {
    const weekdayDate = new Date(anydate);
    weekdayDate.setDate(weekdayDate.getDate() - weekdayDate.getDay() + weekdayNumber);
    weekdayDate.setHours(0);
    weekdayDate.setMinutes(0);
    weekdayDate.setSeconds(0);
    weekdayDate.setMilliseconds(0);

    return weekdayDate;
  }

  getStartOfDayDate(anydate: Date) {
    const startofdayDate = new Date(anydate);
    startofdayDate.setHours(0);
    startofdayDate.setMinutes(0);
    startofdayDate.setSeconds(0);
    startofdayDate.setMilliseconds(0);
    return startofdayDate;
  }

  getEndOfDayDate(anydate: Date) {
    const endofdayDate = new Date(anydate);
    endofdayDate.setHours(23);
    endofdayDate.setMinutes(59);
    endofdayDate.setSeconds(59);
    endofdayDate.setMilliseconds(0);
    return endofdayDate;
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
}
