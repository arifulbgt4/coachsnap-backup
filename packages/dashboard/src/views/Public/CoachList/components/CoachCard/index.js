import React from 'react';
import Card from 'antd/lib/card';
import 'antd/lib/card/style';
import Col from 'antd/lib/col';
import 'antd/lib/col/style';
import { Link } from 'react-router-dom';

import { CoverImage, ProfileImage } from 'src/components/Image';

import CoverImagePlaceHolder from 'src/assets/images/placeholder-image-cover.png';
import ProfileImagePlaceHolder from 'src/assets/images/avatar-placeholder.jpg';

import './style.less';

const CoachCard = ({
  name,
  username,
  sessionTypes,
  profileImage,
  coverImage,
  biography,
}) => {
  const totalSessions = sessionTypes.reduce(
    (out, s) => out + s.sessions.length,
    0
  );

  return (
    <Col xs={24} sm={24} md={12} lg={8} xl={6} className="coach-card">
      <Link to={`/public/c/${username}`}>
        <Card
          className="coach-profile-card"
          cover={<CoverImage src={coverImage.url || CoverImagePlaceHolder} />}
          actions={[
            <p>
              <span>{totalSessions}</span>
              <span>Sessions</span>
            </p>,
          ]}
        >
          <div className="profile-img">
            <ProfileImage
              src={profileImage.url || ProfileImagePlaceHolder}
              width={150}
            />
          </div>
          <div className="content">
            <div className="coach-basic-in">
              <h2>{name}</h2>
              <p style={{ textTransform: 'unset' }}>{biography}</p>
            </div>
          </div>
        </Card>
      </Link>
    </Col>
  );
};

export default CoachCard;
