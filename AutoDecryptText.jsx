import { useEffect, useState } from 'react';
import DecryptedText from './DecryptedText';

export default function AutoDecryptText({ text, interval = 4000, ...props }) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setKey(prev => prev + 1);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <DecryptedText
      key={key}
      text={text}
      animateOn="view"
      {...props}
    />
  );
}
