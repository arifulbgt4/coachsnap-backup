import React, { useEffect } from 'react';
import Layout from 'antd/lib/layout';
import 'antd/lib/layout/style';
import Icon from 'src/components/Icon';
import User from '@ant-design/icons-svg/lib/asn/UserOutlined';
import Setting from '@ant-design/icons-svg/lib/asn/SettingOutlined';
import Logout from '@ant-design/icons-svg/lib/asn/LogoutOutlined';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import Avatar from 'antd/lib/avatar';
import 'antd/lib/avatar/style';
import Dropdown from 'antd/lib/dropdown';
import 'antd/lib/dropdown/style';
import Button from 'antd/lib/button';
import 'antd/lib/button/style';
import message from 'antd/lib/message';
import 'antd/lib/message/style';
import { Link, withRouter } from 'react-router-dom';
import { useDispatch, connect } from 'react-redux';

import { logoutUser } from 'src/state/ducks/authentication/actions';
import { toggleSidebar } from 'src/state/ducks/ui/actions';
import './style.less';
import { ProfileImage } from '../Image';

const PublicHeader = ({ user, toggleSidebar, username }) => {
  const dispatch = useDispatch();
  const handleLogout = () => {
    if (username) {
      logoutUser({ username })(dispatch);
    } else {
      logoutUser({})(dispatch);
    }
    message.warning('You are now logged out!');
  };

  useEffect(() => {
    toggleSidebar(false);
  }, [toggleSidebar]);

  const menu = (
    <div className="header-avatar-overlay">
      <Link
        to={user.role === 'ADMIN' ? '/admin' : `/public/c/${user.username}`}
      >
        <div className="overlay-head">
          <Avatar size={50} className="profile-img">
            {user.profileImage?.url ? (
              <ProfileImage src={user.profileImage.url} width="55" />
            ) : (
              <Icon type={User} className="user" />
            )}
          </Avatar>
          <span className="name">{user.name}</span>
        </div>
      </Link>
      {user.role !== 'ADMIN' && user.role !== 'CUSTOMER' && (
        <div className="overlay-body">
          <ul>
            <li>
              <Link to="/coach/settings">
                <Icon type={Setting} />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </div>
      )}
      <div className="overlay-body-logout">
        <Button
          onClick={handleLogout}
          style={{ display: 'block', width: '100%', textAlign: 'left' }}
          type="link"
        >
          <Icon type={Logout} />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <Layout.Header className="panel-header">
      <Row className="header-row-mobile">
        <Col span={3} onClick={() => toggleSidebar(true)}>
          <div className="coach-panel-logo mobile-logo">
            C<span style={{ color: 'rgb(24, 144, 255)' }}>S</span>
          </div>
        </Col>
        <Col span={3} offset={21}>
          <div className="panel-avatar">
            <Dropdown overlay={menu} trigger={['click']}>
              <Avatar size={50} className="profile-img">
                {user.profileImage?.url ? (
                  <ProfileImage src={user.profileImage.url} width="55" />
                ) : (
                  <Icon type={User} className="user" />
                )}
              </Avatar>
            </Dropdown>
          </div>
        </Col>
      </Row>
    </Layout.Header>
  );
};

const mapStateToProps = state => ({
  user: state.authState.user,
});

export default connect(mapStateToProps, { toggleSidebar })(
  withRouter(PublicHeader)
);
