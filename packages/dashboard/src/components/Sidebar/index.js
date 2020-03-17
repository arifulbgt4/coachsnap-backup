import React, { memo } from 'react';
import { connect } from 'react-redux';
import Layout from 'antd/lib/layout';
import 'antd/lib/layout/style';
import Menu from 'antd/lib/menu';
import 'antd/lib/menu/style';
import Dashboard from '@ant-design/icons-svg/lib/asn/DashboardOutlined';
import Calendar from '@ant-design/icons-svg/lib/asn/CalendarOutlined';
import Dollar from '@ant-design/icons-svg/lib/asn/DollarCircleOutlined';
import User from '@ant-design/icons-svg/lib/asn/UserOutlined';
import Reconciliation from '@ant-design/icons-svg/lib/asn/ReconciliationOutlined';
import Tool from '@ant-design/icons-svg/lib/asn/ToolOutlined';
import Icon from 'src/components/Icon';

import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import { toggleSidebar } from 'src/state/ducks/ui/actions';
import Logo from '../Logo';

import './style.less';

const { Sider } = Layout;

const Sidebar = withRouter(
  ({
    location: { pathname },
    user,
    collapse,
    showSidebar,
    toggleSidebar,
    history,
  }) => {
    // changing the routes
    const changePath = path => {
      history.push(path);
    };

    return (
      <Sider
        collapsed
        collapsible
        reverseArrow
        defaultCollapsed={collapse}
        breakpoint="lg"
        onCollapse={(collapsed, type) => {
          toggleSidebar(collapsed);
        }}
        // collapsedWidth="0"
        className={classnames('coach-panel-sidebar', {
          'mobile-collapse': collapse,
          'show-mobile': showSidebar,
        })}
      >
        <Logo user={user} />
        {user.role === 'COACH' && (
          <Menu
            mode="inline"
            theme="dark"
            defaultSelectedKeys={[pathname]}
            style={{ borderRight: 0 }}
          >
            <Menu.Item
              key="/coach/dashboard"
              onClick={() => changePath('/coach/dashboard')}
            >
              <Icon type={Dashboard} />
              <span>Dashboard</span>
            </Menu.Item>

            <Menu.Item
              key="/coach/calendar"
              onClick={() => changePath('/coach/calendar')}
            >
              <Icon type={Calendar} />
              <span>Calendar</span>
            </Menu.Item>

            <Menu.Item
              key="/coach/customers"
              onClick={() => changePath('/coach/customers')}
            >
              <Icon type={User} />
              <span>Customers</span>
            </Menu.Item>

            <Menu.Item
              key="/coach/sessions"
              onClick={() => changePath('/coach/sessions')}
            >
              <Icon type={Reconciliation} />
              <span>Sessions</span>
            </Menu.Item>

            <Menu.Item
              key="/coach/settings"
              onClick={() => changePath('/coach/settings')}
            >
              <Icon type={Tool} />
              <span>Settings</span>
            </Menu.Item>

            <Menu.Item
              key="/coach/payment"
              onClick={() => changePath('/coach/payment')}
            >
              <Icon type={Dollar} />
              <span>Payments</span>
            </Menu.Item>
          </Menu>
        )}
        {user.role === 'ADMIN' && (
          <Menu
            mode="inline"
            theme="dark"
            defaultSelectedKeys={[pathname]}
            style={{ borderRight: 0 }}
          >
            <Menu.Item
              key="/admin/coaches"
              onClick={() => changePath('/admin/coaches')}
            >
              <Icon type={User} />
              <span>Coaches</span>
            </Menu.Item>

            <Menu.Item
              key="/admin/payment"
              onClick={() => changePath('/admin/payment')}
            >
              <Icon type={Dollar} />
              <span>Payments</span>
            </Menu.Item>
          </Menu>
        )}
      </Sider>
    );
  }
);

const mapStateToProps = state => ({
  user: state.authState.user,
  showSidebar: state.uiState.showSideBar,
});

export default connect(mapStateToProps, { toggleSidebar })(memo(Sidebar));
