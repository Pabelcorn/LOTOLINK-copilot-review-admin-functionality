import { useRef, useEffect, KeyboardEvent } from 'react';
import '../pages/Auth/styles.css';

interface OTPInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ length, value, onChange, onComplete }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    // Call onComplete when OTP is filled
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = (index: number, inputValue: string) => {
    const newValue = inputValue.slice(-1); // Only take last character
    const newOtp = value.split('');
    newOtp[index] = newValue;
    const updatedOtp = newOtp.join('');

    onChange(updatedOtp);

    // Auto-focus next input
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    onChange(pastedData);

    // Focus last filled input or last input
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="otp-input-container">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="tel"
          maxLength={1}
          className={`otp-input ${value[index] ? 'filled' : ''}`}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          inputMode="numeric"
          pattern="[0-9]*"
        />
      ))}
    </div>
  );
};

export default OTPInput;
