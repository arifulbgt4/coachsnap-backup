import React from 'react';
import { withRouter } from 'react-router-dom';
import Link from '@ant-design/icons-svg/lib/asn/LinkOutlined';
import Phone from '@ant-design/icons-svg/lib/asn/PhoneOutlined';
import Facebook from '@ant-design/icons-svg/lib/asn/FacebookOutlined';
import Twitter from '@ant-design/icons-svg/lib/asn/TwitterOutlined';
import { useSelector } from 'react-redux';

import Icon from 'src/components/Icon';

import ProfileImagePlaceholder from 'src/assets/images/avatar-placeholder.jpg';
import { ProfileImage } from 'src/components/Image';

import './style.less';

const normalizeUrl = require('normalize-url');

const CoachInfo = ({
  profileImage,
  name,
  biography,
  website,
  mobile,
  facebook,
  twitter,
  username,
}) => {
  let isCustomer = false;
  const storage = Object.keys(localStorage);
  storage.map(obj => {
    if (obj === username) {
      isCustomer = true;
    }
  });
  const preprendFacebook =
    facebook && facebook.includes('facebook')
      ? normalizeUrl(facebook)
      : `https://facebook.com/${facebook}`;

  const preprendTwitter =
    twitter && twitter.includes('twitter')
      ? normalizeUrl(twitter)
      : `https://twitter.com/${twitter}`;

  const prependNumber = mobile && `tel:${mobile}`;

  return (
    <div className="coach-bio">
      <div className="profile-img">
        <ProfileImage
          src={profileImage.url || ProfileImagePlaceholder}
          width="200"
        />
      </div>
      <div className="content">
        <div className="coach-basic-in">
          <h2>{name}</h2>
        </div>
        <div className="bio">{biography}</div>
        <ul className="contact">
          <li>
            {website && (
              <>
                <Icon type={Link} />
                <a
                  href={normalizeUrl(website)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {website}
                </a>
              </>
            )}
          </li>
          <li>
            {mobile && (
              <>
                <Icon type={Phone} />
                <a
                  href={prependNumber}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {mobile}
                </a>
              </>
            )}
          </li>
          <li>
            {facebook && (
              <>
                <Icon type={Facebook} />
                <a
                  href={preprendFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {facebook}
                </a>
              </>
            )}
          </li>
          <li>
            {twitter && (
              <>
                <Icon type={Twitter} />
                <a
                  href={preprendTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {twitter}
                </a>
              </>
            )}
          </li>
          <li>
            {isCustomer ? (
              <a href={`/${username}/customer/dashboard`}>Go to dashboard</a>
            ) : (
              <a href={`/${username}/signin`}>Sign in</a>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default withRouter(CoachInfo);
