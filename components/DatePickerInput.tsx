import { Button } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useState } from 'react';
import { format } from 'date-fns';

interface DatePickerInputProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  style?: any;
}

export function DatePickerInput({ label, value, onChange, style }: DatePickerInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Button 
        mode="outlined"
        onPress={() => setIsVisible(true)}
        style={style}
      >
        {format(value, 'MMM dd, yyyy')}
      </Button>
      
      <DateTimePickerModal
        isVisible={isVisible}
        mode="date"
        onConfirm={(date) => {
          onChange(date);
          setIsVisible(false);
        }}
        onCancel={() => setIsVisible(false)}
        date={value}
        minimumDate={new Date()}
      />
    </>
  );
}