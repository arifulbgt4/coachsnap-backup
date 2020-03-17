import React from 'react';
import Row from 'antd/lib/row';
import 'antd/lib/row/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import Icon from 'src/components/Icon';
import CaretRight from '@ant-design/icons-svg/lib/asn/CaretRightFilled';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './style.less';

const Navbar = ({ authState }) => {
  const {
    isAuthenticated,
    user: { role },
  } = authState;
  const isAdmin = role === 'ADMIN';
  const isCustomer = role === 'CUSTOMER';
  const panelBtn = isAdmin ? (
    <Link to="/admin" className="go-coach-panel">
      Admin Panel
      <Icon type={CaretRight} />
    </Link>
  ) : (
    <Link to="/coach/dashboard" className="go-coach-panel">
      Coach Panel
      <Icon type={CaretRight} />
    </Link>
  );
  return (
    <header className="public-page-header">
      <Row>
        <Col xs={10} sm={10} md={18} lg={18} xl={18}>
          <Link to="/" className="logo-public">
            Coach <span>Snap</span>
          </Link>
        </Col>
        <Col xs={14} sm={14} md={6} lg={6} xl={6}>
          <div className="user-inter">
            {isAuthenticated && !isCustomer ? (
              panelBtn
            ) : (
              <>
                <Link to="/signin" className="sign-in-button">
                  Sign In
                </Link>
                <Link to="/signup" className="sign-up-button">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </Col>
      </Row>
    </header>
  );
};

const mapStateToProps = state => ({
  authState: state.authState,
});

export default connect(mapStateToProps)(Navbar);
