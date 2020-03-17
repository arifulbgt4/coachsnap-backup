import { useState } from 'react';

export default initial => {
  const [state, setState] = useState(initial);
  function open(e) {
    e.stopPropagation();
    setState(true);
  }
  function cancel() {
    setState(false);
  }
  function close() {
    setState(false);
  }
  return [state, open, close, cancel];
};
