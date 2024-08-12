/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import  './../styles/components/Sidebar.css';
import './../styles/components/navbarLayout.css';



const NavbarLayout = ({ children }) => {
  return (
    <>
      <div className="navbar-layout">
      <Grid container spacing={2} className="grid-container">
        <Navbar />
        <Outlet />
      </Grid>
      </div>
    </>
  );
};

export default NavbarLayout;