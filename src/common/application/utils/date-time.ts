import moment from 'moment';

export enum Duration {
  DAY    = 'day',
  HOUR   = 'hour',
  MINUTE = 'minute',
  SECOND = 'second',
}

export class DateTime {

  moment: moment.Moment;

  constructor(sourceDateTime?: DateTime | string | Date) {
    if (sourceDateTime === undefined) {
      this.moment = moment();
    } else if (typeof sourceDateTime === 'string') {
      this.moment = moment(new Date(sourceDateTime));
    } else if (sourceDateTime instanceof Date) {
      this.moment = moment(sourceDateTime);
    } else {
      this.moment = moment(sourceDateTime.moment);
    }
  }

  add(amount: number, unit: Duration): DateTime {
    const momentUnit = unit.valueOf() as moment.unitOfTime.DurationConstructor;
    this.moment.add(amount, momentUnit);
    return this;
  }

  format(formatString: string): string {
    return this.moment.format(formatString);
  }

  daysDiff(targetDate: DateTime | string | Date): number {
    const date = new DateTime(targetDate);
    const today = this.moment.startOf(Duration.DAY);
    return date.moment.startOf(Duration.DAY).diff(today, Duration.DAY);
  }

}
