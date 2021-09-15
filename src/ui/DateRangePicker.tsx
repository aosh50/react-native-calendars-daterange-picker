import { addDays, differenceInDays, format } from 'date-fns';
import React, { useState, useCallback, useEffect } from 'react';
import {
  Calendar,
  CalendarProps,
  DateObject,
  PeriodMarking,
} from 'react-native-calendars';
import ErrorBoundary from './ErrorBoundary';

export type DateRangePickerProps = {
  initialRange?: [Date, Date];
  onSuccess: (from: Date, to: Date) => void;
} & CalendarProps;

export type MarkedDates = Record<string, PeriodMarking>;

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  initialRange,
  onSuccess,
  ...calendarProps
}) => {
  const [isFromDatePicked, setIsFromDatePicked] = useState(false);
  const [isToDatePicked, setIsToDatePicked] = useState(false);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [fromDate, setFromDate] = useState(
    initialRange ? initialRange[0] : null
  );
  const themeSelectedColour = React.useCallback(
    () => ({
      color: '#000',
      textColor: '#fff',
    }),
    []
  );

  const setupMarkedDates = React.useCallback(
    (
      from: Date,
      toDate: Date,
      updatedMarkedDates: MarkedDates
    ): [MarkedDates, number] => {
      const range = differenceInDays(from, toDate);
      if (range >= 0) {
        if (range === 0) {
          updatedMarkedDates = {
            [format(toDate, 'yyyy-MM-dd')]: themeSelectedColour(),
          };
        } else {
          for (var i = 1; i <= range; i++) {
            const tempDate = format(addDays(from, i), 'yyyy-MM-dd');
            if (i < range) {
              updatedMarkedDates[tempDate] = themeSelectedColour();
            } else {
              updatedMarkedDates[tempDate] = {
                endingDay: true,
                ...themeSelectedColour(),
              };
            }
          }
        }
      }
      return [updatedMarkedDates, range];
    },
    [themeSelectedColour]
  );

  const setupInitialRange = useCallback(() => {
    if (!initialRange) return;
    const [from, toDate] = initialRange;
    const initialMarkedDate = {
      [format(from, 'yyyy-MM-dd')]: {
        startingDay: true,
        ...themeSelectedColour(),
      },
    };
    const [initialMarkedDates] = setupMarkedDates(
      from,
      toDate,
      initialMarkedDate
    );
    setMarkedDates(initialMarkedDates);
  }, [initialRange, setupMarkedDates, themeSelectedColour]);
  useEffect(() => {
    setupInitialRange();
  }, [setupInitialRange]);

  const setupStartMarker = (day: DateObject) => {
    const dayDate = new Date(day.dateString);
    const updatedMarkedDates = {
      [format(dayDate, 'yyyy-MM-dd')]: {
        startingDay: true,
        ...themeSelectedColour(),
      },
    };
    console.log('updatedMarkedDates', updatedMarkedDates);
    setIsFromDatePicked(true);
    setIsToDatePicked(false);
    setFromDate(dayDate);
    setMarkedDates(updatedMarkedDates);
  };

  const onDayPress = (day: DateObject) => {
    console.log('onDayPress', isFromDatePicked, isToDatePicked, day);

    if (!isFromDatePicked || (isFromDatePicked && isToDatePicked)) {
      setupStartMarker(day);
    } else if (!isToDatePicked) {
      const [mMarkedDates, range] = setupMarkedDates(
        fromDate!,
        new Date(day.dateString),
        markedDates
      );
      console.log('onDayPresssetupMarkedDates', mMarkedDates, range);

      if (range >= 0) {
        setIsToDatePicked(true);
        setMarkedDates(mMarkedDates);
        onSuccess(fromDate!, new Date(day.dateString));
      } else {
        setupStartMarker(day);
      }
    }
  };

  return (
    <ErrorBoundary>
      <Calendar
        {...calendarProps}
        markingType={'period'}
        current={fromDate ?? undefined}
        markedDates={markedDates}
        onDayPress={(day) => {
          onDayPress(day);
        }}
      />
    </ErrorBoundary>
  );
};
