import { increaseTimeTo, duration } from './increaseTime';

export const event_period = {

  premiumSales_startTime: function (val) { return val + duration.weeks(1); },
  premiumSales_endTime: function (val) { return val + duration.weeks(4); },
  preSales_startTime: function (val) { return val + duration.weeks(1); },
  preSales_endTime: function (val) { return val + duration.weeks(4); },
  publicSales_startTime: function (val) { return val + duration.weeks(1); },
  publicSales_endTime: function (val) { return val + duration.weeks(4); },
  afterPreSales_endTime: function (val) { return val + duration.seconds(1); },
  afterEndTime: function (val) { return val + duration.seconds(1); },
  lockUpTime: function (val) { return val + duration.weeks(1); },
};
