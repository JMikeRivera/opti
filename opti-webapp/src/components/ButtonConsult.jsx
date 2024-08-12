/* eslint-disable no-unused-vars */
import React from 'react';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PropTypes from 'prop-types';

const MyButton = ({ onClick, texto, mL, height, mT, mR, backColor }) => {
  return (
    <Button
      variant="contained"
      startIcon={<CheckCircleIcon />}
      style={{
        backgroundColor: backColor,
        color: 'white',
        alignContent: 'center',
        marginLeft: mL,
        verticalAlign: 'bottom',
        height: height,
        marginTop: mT,
        marginRight: mR,
      }}
      onClick={onClick}
    >
      {texto}
    </Button>
  );
};

MyButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    texto: PropTypes.string.isRequired,
    mL: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    mT: PropTypes.string.isRequired,
    mR: PropTypes.string.isRequired
  };
  

export default MyButton;