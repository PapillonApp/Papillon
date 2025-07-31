import { differenceInHours, differenceInMinutes } from "date-fns";

const leadingZero = (num: number) => {
  return num < 10 ? `0${num}` : num;
};

const getAbsenceTime = (fromTimestamp: number, toTimestamp: number) => {
  const from = new Date(fromTimestamp);
  const to = new Date(toTimestamp);

  const hours = differenceInHours(to, from);
  const minutes = differenceInMinutes(to, from) % 60;

  return {
    diff: to.getTime() - from.getTime(),
    hours,
    withMinutes: leadingZero(minutes),
    minutes: differenceInMinutes(to, from),
  };
};

export { getAbsenceTime, leadingZero };
