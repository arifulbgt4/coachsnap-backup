// External Components
import React from 'react';

export default ({ format, week }) => {
  // Week clone locally
  const weeks = week.clone();

  return (
    <>
      {/* Week start date */}
      <span>{weeks.format(format)}</span>-{/* Week end date */}
      <span>{weeks.add(6, 'day').format(format)}</span>
    </>
  );
};
