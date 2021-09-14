import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { DateRangePicker } from 'react-native-calendars-daterange-picker';

export default function App() {


  return (
    <View style={styles.container}>
      <DateRangePicker
        initialRange={[new Date(), new Date()]}
        onSuccess={() => {}}
        theme={{}}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
