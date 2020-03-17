import React from 'react';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Dollar from '@ant-design/icons-svg/lib/asn/DollarCircleOutlined';
import Block from '@ant-design/icons-svg/lib/asn/BlockOutlined';
import Icon from 'src/components/Icon';
import Avatar from 'antd/lib/avatar';
import 'antd/lib/avatar/style';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import { connect } from 'react-redux';

import { CoverImage } from 'src/components/Image';

import { concatTimeWithDate } from 'src/utils/date';

import './style.less';

const { mockTimezoneGuess } = require('custom-moment/utils');

const Content = ({
  availability: { start, end },
  businessHour,
  singleEvent,
  name,
  description,
  maxSeats,
  bookings,
  cost,
  coach,
}) => {
  const dateFormat = singleEvent
    ? mockTimezoneGuess(start, coach.timezone).format('MM/DD/YYYY | hh:mm a')
    : mockTimezoneGuess(
        concatTimeWithDate(start, businessHour.start),
        coach.timezone
      ).format('MM/DD/YYYY | hh:mm a');

  const endTime = singleEvent
    ? mockTimezoneGuess(end, coach.timezone).format('hh:mm a')
    : mockTimezoneGuess(
        concatTimeWithDate(end, businessHour.end),
        coach.timezone
      ).format('hh:mm a');

  return (
    <div className="contents">
      <span className="date">
        {dateFormat} - {endTime}
      </span>
      <h3>{name}</h3>
      <p> {singleEvent ? 'Single event' : 'Block event'}</p>
      <p>{description || 'No Description'}</p>
      <Row type="flex" justify="center">
        <Col span={12}>
          <div className="slots">
            <Icon type={Block} />
            {`${maxSeats - bookings.length} spots available`}
          </div>
        </Col>
        <Col span={12}>
          <div className="cost">
            <Icon type={Dollar} />
            <span> {cost} USD</span>
          </div>
        </Col>
      </Row>
    </div>
  );
};

const CardView = props => {
  const { cardSize, img, backgroundImg } = props;
  const imgPlaceholder = backgroundImg();
  if (cardSize === 'big') {
    return (
      <Card
        hoverable
        className="session-big-card"
        cover={<CoverImage src={img || imgPlaceholder} />}
      >
        <Content {...props} />
      </Card>
    );
  }
  return (
    <Card className="session-small-card">
      <Avatar shape="square" size={105} src={img || imgPlaceholder} />
      <Content {...props} />
    </Card>
  );
};

const mapStateToProps = state => ({
  user: state.authState.user,
});

export default connect(mapStateToProps, {})(CardView);
