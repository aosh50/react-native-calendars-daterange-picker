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
      fromDate: Date,
      toDate: Date,
      updatedMarkedDates: MarkedDates
    ): [MarkedDates, number] => {
      const range = differenceInDays(fromDate, toDate);
      if (range >= 0) {
        if (range === 0) {
          updatedMarkedDates = {
            [toDate.toISOString()]: themeSelectedColour(),
          };
        } else {
          for (var i = 1; i <= range; i++) {
            const tempDate = format(addDays(fromDate, i), 'yyyy-MM-dd');
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
      [from.toISOString()]: {
        startingDay: true,
        ...themeSelectedColour,
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
    const updatedMarkedDates = {
      [day.dateString]: { startingDay: true, ...themeSelectedColour },
    };
    setIsFromDatePicked(true);
    setIsToDatePicked(true);
    setFromDate(new Date(day.dateString));
    setMarkedDates(updatedMarkedDates);
  };

  const onDayPress = (day: DateObject) => {
    if (!isFromDatePicked || (isFromDatePicked && isToDatePicked)) {
      setupStartMarker(day);
    } else if (!isToDatePicked) {
      const [mMarkedDates, range] = setupMarkedDates(
        fromDate!,
        new Date(day.dateString),
        markedDates
      );
      if (range >= 0) {
        setIsFromDatePicked(true);
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
