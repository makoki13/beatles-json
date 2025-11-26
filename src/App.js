// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'; // Importamos Link y useLocation
import './App.css';

import Personajes from './components/Personajes';
import Canciones from './components/Canciones';
import Sesiones from './components/Sesiones';
import Grabaciones from './components/Grabaciones';
import Demos from './components/Demos';
import Estudios from './components/Estudio';
import Actuaciones from './components/Actuaciones';
import Entrevistas from './components/Entrevistas';
import Remixes from './components/Remixes';
import Obras from './components/Obras';
import MasterCanciones from './components/MasterCanciones';
import Masters from './components/Masters';
import Discograficas from './components/Discograficas';
import Publicaciones from './components/Publicaciones';

// Componente del Menú Superior
const MenuSuperior = () => {
  const location = useLocation(); // Hook para obtener la ruta actual

  // Función para determinar si el enlace está activo
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { to: "/personajes", label: "People", clase: "menu-superior" },
    { to: "/canciones", label: "Songs", clase: "menu-superior" },
    { to: "/sesiones", label: "Sessions", clase: "menu-superior" },
    { to: "/grabaciones", label: "Recordings", clase: "menu-superior" },
    { to: "/demos", label: "Demos", clase: "menu-listados" },
    { to: "/estudios", label: "Studio", clase: "menu-listados" },
    { to: "/actuaciones", label: "Performance", clase: "menu-listados" },
    { to: "/entrevistas", label: "Interviews", clase: "menu-listados" },
    { to: "/remixes", label: "Remixes", clase: "menu-superior" },
    { to: "/obras", label: "Works", clase: "menu-superior" },
    { to: "/master_canciones", label: "Master Songs", clase: "menu-superior" },
    { to: "/masters", label: "Masters", clase: "menu-superior" },
    { to: "/discograficas", label: "Labels", clase: "menu-superior" },
    { to: "/publicaciones", label: "Publish", clase: "menu-superior" },
  ];

  return (
    <nav className="menu-superior">
      <ul>
        {menuItems.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className={isActive(item.to) ? item.clase : ''}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        {/* Incluir el Menú Superior */}
        <MenuSuperior />

        {/* Contenido Principal - Rutas */}
        <main className="contenido-principal">
          <Routes>
            {/* Ruta para la página principal (opcional) */}
            <Route path="/" element={<div class="bienvenida">Welcome to Beatles' Json</div>} />

            {/* Rutas para cada pantalla de gestión */}
            <Route path="/personajes" element={<Personajes />} />
            <Route path="/canciones" element={<Canciones />} />
            <Route path="/sesiones" element={<Sesiones />} />
            <Route path="/grabaciones" element={<Grabaciones />} />
            <Route path="/demos" element={<Demos />} />
            <Route path="/estudios" element={<Estudios />} />
            <Route path="/actuaciones" element={<Actuaciones />} />
            <Route path="/entrevistas" element={<Entrevistas />} />
            <Route path="/remixes" element={<Remixes />} />
            <Route path="/obras" element={<Obras />} />
            <Route path="/master_canciones" element={<MasterCanciones />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/discograficas" element={<Discograficas />} />
            <Route path="/publicaciones" element={<Publicaciones />} />

            {/* Ruta para manejar rutas no encontradas */}
            <Route path="*" element={<div>Página no encontrada</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;