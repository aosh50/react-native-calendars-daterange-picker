import { addDays, differenceInDays, format } from 'date-fns';
import React, { useState, useCallback, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
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
      const range = differenceInDays(toDate, from);
      console.log('Range', range);
      if (range >= 0) {
        if (range === 0) {
          updatedMarkedDates = {
            [format(toDate, 'yyyy-MM-dd')]: themeSelectedColour(),
          };
        } else {
          for (var i = 1; i <= range; i++) {
            console.log('Loop', i);

            const tempDate = format(addDays(from, i), 'yyyy-MM-dd');
            console.log('tempDate', tempDate);

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
      console.log(updatedMarkedDates);
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
      console.log('Setting To Date', day.dateString, fromDate);
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

  const selectRange = (start: Date, end: Date) => {
    const range = differenceInDays(end, start);
    if (range < 0) {
      setMarkedDates({
        [format(end, 'yyyy-MM-dd')]: {
          startingDay: true,
          ...themeSelectedColour(),
        },
      });
      return;
    }
    const rangeDates: MarkedDates = {
      [format(start, 'yyyy-MM-dd')]: {
        startingDay: true,
        ...themeSelectedColour(),
      },
    };
    for (var i = 1; i <= range; i++) {
      const tempDate = format(addDays(start, i), 'yyyy-MM-dd');
      if (i < range) {
        rangeDates[tempDate] = themeSelectedColour();
      } else {
        rangeDates[tempDate] = {
          endingDay: true,
          ...themeSelectedColour(),
        };
      }
    }
    setMarkedDates(rangeDates);
  };

  const lastMonth = () => {
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    selectRange(startOfLastMonth, endOfLastMonth);
  };
  const lastWeek = () => {
    const now = new Date();
    const startOfLastWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6
    );
    selectRange(startOfLastWeek, now);
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
      <QuickButton title={'Last Month'} onPress={lastMonth} />
      <QuickButton title={'Last 7 days'} onPress={lastWeek} />
    </ErrorBoundary>
  );
};

const QuickButton = ({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  button: {
    // alignItems: 'center',
    // justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    // borderRadius: 4,
    elevation: 3,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: '#000',
    textAlign: 'center',
  },
});
