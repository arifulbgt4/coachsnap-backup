// External Components
import React from 'react';

export default ({ months, format }) => {
  // Month start date
  const startMonth = months.clone().startOf('month');

  // Month end date
  const endMonth = months.clone().endOf('month');

  return (
    <>
      {/* Month start date */}
      <span>{startMonth.format(format)}</span>-{/* Month end date */}
      <span>{endMonth.format(format)}</span>
    </>
  );
};
