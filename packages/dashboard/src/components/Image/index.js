import React, { useEffect, useState, useRef } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

import './style.less';

const CoverImage = ({ src, className }) => {
  const [width, setWidth] = useState(0);

  const ref = useRef(null);

  const resizeImg = size => {
    return src.replace('upload/', `upload/w_${Math.floor(size)},c_fill/`);
  };

  useEffect(() => {
    setWidth(ref.current.offsetWidth);
  }, []);

  return (
    <div ref={ref} className={`cover-image-pack ${className || ''}`}>
      <LazyLoadImage
        alt="cover"
        effect="blur"
        placeholder={<img src={resizeImg(20)} alt="placeholder" />}
        src={resizeImg(width)}
        threshold={50}
        visibleByDefault={Image.src === resizeImg(20)}
      />
    </div>
  );
};

const ProfileImage = ({ width, src, className }) => {
  const resizeImg = size => {
    return src.replace('upload/', `upload/w_${size},h_${size},c_fill/`);
  };
  return <img src={resizeImg(width)} className={className} alt="profile" />;
};

export { CoverImage, ProfileImage };
