// components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import Sidebar from './../styles/components/Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <nav>
        <ul>
          <li><NavLink to="/" end>Inicio</NavLink></li>
          <li><NavLink to="/politicas-de-inventario/informacion">Información de Políticas</NavLink></li>
          <li><NavLink to="/politicas-de-inventario/parametros">Parámetros de Políticas</NavLink></li>
          <li><NavLink to="/politicas-de-inventario/resultados">Resultados de Políticas</NavLink></li>
          <li><NavLink to="/plan-de-reposicion/archivos">Archivos de Reposición</NavLink></li>
          <li><NavLink to="/plan-de-reposicion/resultados">Resultados de Reposición</NavLink></li>
          <li><NavLink to="/Documentacion">Documentación</NavLink></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
