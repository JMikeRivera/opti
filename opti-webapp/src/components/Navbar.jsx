/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './../components/AuthContext';

import './../styles/components/navbar.css';


const NavbarItem = ({ label, children, path, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate(); 
  
    const toggleOpen = () => setIsOpen(!isOpen);

    const handleNavigation = () => {
      if (path) {
          navigate(path);
      }
    };

    if(className === 'activeParent' && !isOpen) {
      className = 'active';
    } else if(className != 'active'){
      className = '';
    }

  
    return (
      <>
        <li className={`navbar-item ${className}`} onClick={() => { toggleOpen(); handleNavigation(); }}>
          {label}
          {children && (
            <svg className={`arrow-icon ${isOpen ? 'open' : ''}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          )}
        </li>
        {isOpen && children}
      </>
    );
};

const DropdownItem = ({ label, path, className }) => {
  const navigate = useNavigate();

  const handleDropdownNavigation = () => {
      if (path) {
          navigate(path);
      }
  };

  return (
      <li className={`dropdown-item ${className}`} onClick={handleDropdownNavigation}>
          {label}
      </li>
  );
};

const ProfileDropdown = ({ username, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="profile-dropdown">
      <div className="profile-dropdown-user">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16">
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1a5 5 0 0 0-4.468 2.64C4.635 12.058 6.255 13 8 13s3.365-.942 4.468-1.36A5 5 0 0 0 8 9z"/>
        </svg>
        {username}
      </div>
      <div className="profile-dropdown-item" onClick={() => navigate('/change-password')}>
        <svg fill="#fff" width="16" height="16" viewBox="0 0 32 32" id="icon" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <defs>
              <style>{`.cls-1 { fill: none; }`}</style>
            </defs>
            <path d="M21,2a8.9977,8.9977,0,0,0-8.6119,11.6118L2,24v6H8L18.3881,19.6118A9,9,0,1,0,21,2Zm0,16a7.0125,7.0125,0,0,1-2.0322-.3022L17.821,17.35l-.8472.8472-3.1811,3.1812L12.4141,20,11,21.4141l1.3787,1.3786-1.5859,1.586L9.4141,23,8,24.4141l1.3787,1.3786L7.1716,28H4V24.8284l9.8023-9.8023.8472-.8474-.3473-1.1467A7,7,0,1,1,21,18Z"></path>
            <circle cx="22" cy="10" r="2"></circle>
            <rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" className="cls-1" width="16" height="16"></rect>
          </g>
        </svg>
        Cambiar contraseña
      </div>
      <div className="profile-dropdown-item" onClick={onLogout}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15 12L2 12M2 12L5.5 9M2 12L5.5 15" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M9.00195 7C9.01406 4.82497 9.11051 3.64706 9.87889 2.87868C10.7576 2 12.1718 2 15.0002 2L16.0002 2C18.8286 2 20.2429 2 21.1215 2.87868C22.0002 3.75736 22.0002 5.17157 22.0002 8L22.0002 16C22.0002 18.8284 22.0002 20.2426 21.1215 21.1213C20.3531 21.8897 19.1752 21.9862 17 21.9983M9.00195 17C9.01406 19.175 9.11051 20.3529 9.87889 21.1213C10.5202 21.7626 11.4467 21.9359 13 21.9827" stroke="#fff" strokeWidth="2" strokeLinecap="round"></path> </g></svg>
        Cerrar sesión
      </div>
    </div>
  );
};



const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const { user, logout } = useAuth();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const isActiveParent = (path) => {
    return location.pathname.includes(path);
  }

  const handleNavigation = (path) => {
    if (path) {
        navigate(path);
    }
  }; 
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileRef]);


  return (
    <nav className="navbar">
        <div className="navbar-header">
          {/*<h1>BTC OPTI</h1>*/}
          <img src="/images/Opti_Smart_Blanco.png" alt="BTC Opti" className='headerLogo'/>
        </div>
        
        <ul className="navbar-menu">
          <NavbarItem label="Home" path="/" className={isActive('/') ? 'active' : ''}/>
          <NavbarItem label="Políticas de inventario" className={isActiveParent('/politicas-de-inventario') ? 'activeParent' : ''}>
            <ul className="navbar-dropdown">
              <DropdownItem label="1. Información" path="/politicas-de-inventario/informacion" className={isActive('/politicas-de-inventario/informacion') ? 'active' : ''}/>
              <DropdownItem label="2. Parámetros" path="/politicas-de-inventario/parametros" className={isActive('/politicas-de-inventario/parametros') ? 'active' : ''}/>
              <DropdownItem label="3. Resultados" path="/politicas-de-inventario/resultados" className={isActive('/politicas-de-inventario/resultados') ? 'active' : ''}/>
            </ul>
          </NavbarItem>
          <NavbarItem label="Plan de reposición" className={isActiveParent('/plan-de-reposicion') ? 'activeParent' : ''}>
            <ul className="navbar-dropdown">
              <DropdownItem label="1. Archivos" path="/plan-de-reposicion/archivos" className={isActive('/plan-de-reposicion/archivos') ? 'active' : ''}/>
              <DropdownItem label="2. Resultados" path="/plan-de-reposicion/resultados" className={isActive('/plan-de-reposicion/resultados') ? 'active' : ''}/>
            </ul>
          </NavbarItem>
        </ul>

        <div className="navbar-footer">
          <div className="navbar-documentacion"  onClick={() => { handleNavigation('/Documentacion'); }}>
            <svg className="navbar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
                Documentación
          </div>
          <div className="navbar-perfil" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <svg className="navbar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Perfil
          </div>
          {isProfileOpen && <ProfileDropdown username={user.userName} onLogout={logout} />}
        </div>

    </nav>
  );
};

export default Navbar;



