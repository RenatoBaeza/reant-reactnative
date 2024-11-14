import { Button } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useState } from 'react';
import { format } from 'date-fns';

interface TimePickerInputProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
  style?: any;
}

export function TimePickerInput({ label, value, onChange, style }: TimePickerInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleConfirm = (date: Date) => {
    onChange(format(date, 'HH:mm'));
    setIsVisible(false);
  };

  return (
    <>
      <Button 
        mode="outlined"
        onPress={() => setIsVisible(true)}
        style={style}
      >
        {value || 'Select Time'}
      </Button>
      
      <DateTimePickerModal
        isVisible={isVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={() => setIsVisible(false)}
        date={value ? new Date(`2000-01-01T${value}`) : new Date()}
      />
    </>
  );
}