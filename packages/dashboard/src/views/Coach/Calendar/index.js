// External Components
import React from 'react';
import Card from 'antd/lib/card';
import Button from 'antd/lib/button';
import Dropdown from 'antd/lib/dropdown';
import Menu from 'antd/lib/menu';
import Down from '@ant-design/icons-svg/lib/asn/DownOutlined';
import WindowSize from '@reach/window-size';

// Own global components
import ScrollDiv from 'src/components/ScrollDiv';
import Icon from 'src/components/Icon';

// Own single components
import Header from './components/CalendarHeader';
import WeekDays from './components/WeekDays';
import CalendarBody from './components/CalendarBody';

// Library Style
import 'antd/lib/card/style';
import 'antd/lib/button/style';
import 'antd/lib/dropdown/style';
import 'antd/lib/menu/style';

// Own Style
import './style.less';

const moment = require('custom-moment');

class Calendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMonth: moment(),
      weekView: false,
      currentWeek: moment()
        .clone()
        .startOf('week'),
    };

    // All bind functions
    this.nextMonth = this.nextMonth.bind(this);
    this.prevMonth = this.prevMonth.bind(this);
    this.weeklyView = this.weeklyView.bind(this);
    this.monthlyView = this.monthlyView.bind(this);
    this.nextWeek = this.nextWeek.bind(this);
    this.prevWeek = this.prevWeek.bind(this);
  }

  // Switch weekly view
  weeklyView() {
    this.setState({ weekView: true });
  }

  // Switch monthly view
  monthlyView() {
    this.setState({
      weekView: false,
      currentMonth: moment(),
    });
  }

  // Switch next month
  nextMonth() {
    this.setState(prevState => prevState.currentMonth.add(1, 'month'));
  }

  // Switch previous month
  prevMonth() {
    this.setState(prevState => prevState.currentMonth.subtract(1, 'month'));
  }

  // Switch next week
  nextWeek() {
    this.setState(prevState => prevState.currentWeek.add(1, 'week'));
  }

  // Switch previous week
  prevWeek() {
    this.setState(prevState => prevState.currentWeek.subtract(1, 'week'));
  }

  render() {
    const { currentMonth, currentWeek, weekView } = this.state;
    // Weekly or Monthly view select list
    const menu = (
      <Menu>
        <Menu.Item key="Monthly" onClick={this.monthlyView}>
          Monthly
        </Menu.Item>
        <Menu.Item key="Weekly" onClick={this.weeklyView}>
          Weekly
        </Menu.Item>
      </Menu>
    );

    return (
      <WindowSize>
        {({ width: windowWidth, height: windowHeight }) => (
          <Card
            className="calendar-page"
            bodyStyle={{ padding: 0 }}
            extra={[
              // Weekly & Monthly view view select
              <Dropdown key="viewby" overlay={menu}>
                <Button>
                  {weekView ? 'Weekly' : 'Monthly'}
                  <Icon type={Down} />
                </Button>
              </Dropdown>,
            ]}
            title={
              // Calnedar header
              <Header
                currentMonth={currentMonth}
                prevMonth={this.prevMonth}
                nextMonth={this.nextMonth}
                prevWeek={this.prevWeek}
                nextWeek={this.nextWeek}
                weeklyView={this.weeklyView}
                monthlyView={this.monthlyView}
                weekView={weekView}
                currentWeek={currentWeek}
              />
            }
          >
            <ScrollDiv height={windowWidth > 768 ? 178 : 224} auto>
              <div className="body-box" style={{ minWidth: 1200 }}>
                {/* Week days name */}
                <WeekDays weeklyview={weekView} currentWeek={currentWeek} />

                {/* Calendar body */}
                <CalendarBody
                  weekView={weekView}
                  currentWeek={currentWeek}
                  currentMonth={currentMonth}
                />
              </div>
            </ScrollDiv>
          </Card>
        )}
      </WindowSize>
    );
  }
}

export default Calendar;
