/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import './../styles/components/infoButton.css';

const InfoButton = ({ information }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="info-button-container">
      <button
        className="info-button"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        i
      </button>
      {isHovered && <div className="info-tooltip">{information}</div>}
    </div>
  );
};

InfoButton.propTypes = {
  information: PropTypes.string.isRequired,
};

export default InfoButton;
