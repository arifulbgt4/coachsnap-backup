// External Components
import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Button from 'antd/lib/button';
import Left from '@ant-design/icons-svg/lib/asn/LeftOutlined';
import Right from '@ant-design/icons-svg/lib/asn/RightOutlined';

// Own global components
import Icon from 'src/components/Icon';

// Own single components
import WeekView from './WeekView';
import MonthView from './MonthView';

// Library Style
import 'antd/lib/row/style';
import 'antd/lib/col/style';
import 'antd/lib/button/style';

// Own Style
import './style.less';

const CalendarHeader = props => {
  const format = 'MMM DD';

  const {
    currentMonth,
    prevMonth,
    nextMonth,
    prevWeek,
    nextWeek,
    weekView,
    currentWeek,
  } = props;

  return (
    <Row className="calendar-header">
      {/* Switch previous month/week button */}
      <Col style={{ textAlign: 'left' }} span={3}>
        <Button type="primary" onClick={!weekView ? prevMonth : prevWeek}>
          <Icon type={Left} />
        </Button>
      </Col>

      {/* Showing current month/week as title */}
      <Col span={18}>
        <div className="calendar-title-date">
          {weekView ? (
            <WeekView week={currentWeek} format={format} /> // Weekly title
          ) : (
            <MonthView months={currentMonth} format={format} /> // Mothly title
          )}
        </div>
      </Col>

      {/* Switch next month/week  button */}
      <Col style={{ textAlign: 'right' }} span={3}>
        <Button type="primary" onClick={!weekView ? nextMonth : nextWeek}>
          <Icon type={Right} />
        </Button>
      </Col>
    </Row>
  );
};

export default CalendarHeader;
