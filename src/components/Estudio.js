// src/components/Estudios.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Estudios.css'; // Opcional: archivo de estilos

const API_BASE_URL = 'http://localhost:3001/api';

const Estudios = () => {
  const [vistaActual, setVistaActual] = useState('listar'); // Solo listar y buscar
  const [estudios, setEstudios] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaForm, setBusquedaForm] = useState({
    descripcion_grabacion: '' // Campo de ejemplo para búsqueda
    // Puedes añadir más campos aquí en el futuro (tipo, fecha, lugar, tipo_estudio, ordinal)
  });

  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // --- Componente Reutilizable TablaEstudios ---
  const TablaEstudios = useCallback(({ estudios, cargando, titulo = "Estudios" }) => {
    return (
      <div className="tabla-estudios">
        {estudios.length === 0 ? (
          <p>No hay datos para mostrar.</p>
        ) : (
          <table>
            <thead>
              <tr>                
                <th>Recording Description</th>
                <th>Kind</th>
                <th>Date</th>
                <th>Place</th>
                <th>Kind Take</th>
                <th>Ordinal</th>
                {/* No hay botones de Editar/Borrar en esta vista */}
              </tr>
            </thead>
            <tbody>
              {estudios.map((estudio) => (
                <tr key={estudio.id_grabacion}>                  
                  <td>{estudio.grabacion ? estudio.grabacion.descripcion : '-'}</td>
                  <td>{estudio.grabacion ? estudio.grabacion.tipo : '-'}</td>
                  <td>{estudio.grabacion ? estudio.grabacion.fecha : '-'}</td>
                  <td>{estudio.grabacion ? estudio.grabacion.lugar : '-'}</td>
                  <td>{estudio.tipo}</td>
                  <td>{estudio.ordinal !== null && estudio.ordinal !== undefined ? estudio.ordinal : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }, []);


  // --- Funciones ---

  const obtenerEstudios = useCallback(async () => {
    setCargando(true);
    setMensajeError('');
    try {
      const response = await fetch(`${API_BASE_URL}/estudios?sort=id_grabacion&order=ASC`); // O sort=grabacion.descripcion, etc.
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setEstudios(data);
    } catch (error) {
      console.error('Error al cargar estudios:', error);
      setMensajeError(`Error al cargar los estudios: ${error.message}`);
      setEstudios([]);
    } finally {
      setCargando(false);
    }
  }, []);

  const manejarCambioBusqueda = useCallback((e) => {
    const { name, value } = e.target;
    setBusquedaForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const ejecutarBusqueda = useCallback(() => {
    setCargando(true);
    setMensajeError('');

    try {
      let resultados = estudios;

      if (busquedaForm.descripcion_grabacion) {
        resultados = resultados.filter(estudio =>
          estudio.grabacion && estudio.grabacion.descripcion.toLowerCase().includes(busquedaForm.descripcion_grabacion.toLowerCase())
        );
      }
      // Puedes añadir más condiciones aquí para otros campos de búsqueda en el futuro
      // if (busquedaForm.tipo_estudio) { ... }
      // if (busquedaForm.fecha_grabacion) { ... }

      setResultadosBusqueda(resultados);
      setMensajeError('');
    } catch (error) {
      console.error('Error al filtrar estudios:', error);
      setMensajeError(`Error al filtrar los estudios: ${error.message}`);
      setResultadosBusqueda([]);
    } finally {
      setCargando(false);
    }
  }, [estudios, busquedaForm]);

  const limpiarBusqueda = useCallback(() => {
    setBusquedaForm({
      descripcion_grabacion: ''
      // Reinicia otros campos de búsqueda si los añades
    });
    setResultadosBusqueda([]);
    setMensajeError('');
  }, []);


  // --- Componentes de Vista Memorizados ---

  const VistaListar = useMemo(() => (
    <div className="vista-listar">      
      {mensajeError && vistaActual === 'listar' && <div className="error-message">{mensajeError}</div>}
      {cargando && vistaActual === 'listar' && <div className="loading">Cargando...</div>}
      {!cargando && vistaActual === 'listar' && estudios.length === 0 ? (
        <p>No hay estudios registrados.</p>
      ) : vistaActual === 'listar' ? (
        <TablaEstudios
          estudios={estudios}
          cargando={cargando}
        />
      ) : null}
    </div>
  ), [estudios, mensajeError, cargando, vistaActual]);


  const VistaBuscar = useMemo(() => (
    <div className="vista-buscar">      
      <form onSubmit={(e) => { e.preventDefault(); ejecutarBusqueda(); }} className="busqueda-form">
        <label>
          Recording description:
          <input
            type="text"
            name="descripcion_grabacion"
            value={busquedaForm.descripcion_grabacion}
            onChange={manejarCambioBusqueda}
          />
        </label>
        {/* Puedes añadir más campos de búsqueda aquí */}
        <button type="submit" disabled={cargando}>Search</button>
        <button type="button" onClick={limpiarBusqueda} disabled={cargando}>Reset</button>
      </form>

      {mensajeError && vistaActual === 'buscar' && <div className="error-message">{mensajeError}</div>}
      {cargando && vistaActual === 'buscar' && <div className="loading">Searching...</div>}

      {!cargando && vistaActual === 'buscar' && (
        <TablaEstudios
          estudios={resultadosBusqueda}
          cargando={cargando}
          titulo="Resultados de la Búsqueda"
        />
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && busquedaForm.descripcion_grabacion && (
        <p>There's no data to show.</p>
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && !busquedaForm.descripcion_grabacion && (
        <p>Introduce string to look up and choose "Search".</p>
      )}
    </div>
  ), [busquedaForm, ejecutarBusqueda, limpiarBusqueda, manejarCambioBusqueda, mensajeError, cargando, vistaActual, resultadosBusqueda]);


  // --- Efecto ---
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerEstudios();
    }
  }, [vistaActual, obtenerEstudios]);


  // --- Renderizado ---
  return (
    <div className="estudios-container">      
      <nav className="menu-lateral">
        <ul>
          <li>
            <button
              className={vistaActual === 'listar' ? 'active' : ''}
              onClick={() => setVistaActual('listar')}
            >
              List
            </button>
          </li>
          <li>
            <button
              className={vistaActual === 'buscar' ? 'active' : ''}
              onClick={() => setVistaActual('buscar')}
            >
              Search
            </button>
          </li>
          {/* No hay opción de "Nuevo" para Estudios */}
        </ul>
      </nav>

      <main className="contenido-principal">
        {vistaActual === 'listar' && VistaListar}
        {vistaActual === 'buscar' && VistaBuscar}
        {/* No hay vista "nuevo" */}
      </main>
    </div>
  );
};

export default Estudios;