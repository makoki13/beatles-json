// src/components/Actuaciones.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Actuaciones.css'; // Opcional: archivo de estilos

const API_BASE_URL = 'http://localhost:3001/api';

const Actuaciones = () => {
  const [vistaActual, setVistaActual] = useState('listar'); // Solo listar y buscar
  const [actuaciones, setActuaciones] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaForm, setBusquedaForm] = useState({
    descripcion_grabacion: '' // Campo de ejemplo para búsqueda
    // Puedes añadir más campos aquí en el futuro (tipo, fecha, lugar, tipo_actuacion, ordinal)
  });

  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // --- Componente Reutilizable TablaActuaciones ---
  const TablaActuaciones = useCallback(({ actuaciones, cargando, titulo = "Actuaciones" }) => {
    return (
      <div className="tabla-actuaciones">        
        {actuaciones.length === 0 ? (
          <p>No data to show.</p>
        ) : (
          <table>
            <thead>
              <tr>                
                <th>Recording Description</th>
                <th>Kind</th>
                <th>Date</th>
                <th>Place</th>
                <th>Performance kind</th>
                <th>Ordinal</th>
                {/* No hay botones de Editar/Borrar en esta vista */}
              </tr>
            </thead>
            <tbody>
              {actuaciones.map((actuacion) => (
                <tr key={actuacion.id_grabacion}>                  
                  <td>{actuacion.grabacion ? actuacion.grabacion.descripcion : '-'}</td>
                  <td>{actuacion.grabacion ? actuacion.grabacion.tipo : '-'}</td>
                  <td>{actuacion.grabacion ? actuacion.grabacion.fecha : '-'}</td>
                  <td>{actuacion.grabacion ? actuacion.grabacion.lugar : '-'}</td>
                  <td>{actuacion.tipo}</td>
                  <td>{actuacion.ordinal}</td> {/* ordinal no debería ser null según el modelo */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }, []);


  // --- Funciones ---

  const obtenerActuaciones = useCallback(async () => {
    setCargando(true);
    setMensajeError('');
    try {
      const response = await fetch(`${API_BASE_URL}/actuaciones?sort=id_grabacion&order=ASC`); // O sort=grabacion.descripcion, etc.
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setActuaciones(data);
    } catch (error) {
      console.error('Error al cargar actuaciones:', error);
      setMensajeError(`Error al cargar las actuaciones: ${error.message}`);
      setActuaciones([]);
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
      let resultados = actuaciones;

      if (busquedaForm.descripcion_grabacion) {
        resultados = resultados.filter(actuacion =>
          actuacion.grabacion && actuacion.grabacion.descripcion.toLowerCase().includes(busquedaForm.descripcion_grabacion.toLowerCase())
        );
      }
      // Puedes añadir más condiciones aquí para otros campos de búsqueda en el futuro
      // if (busquedaForm.tipo_actuacion) { ... }
      // if (busquedaForm.fecha_grabacion) { ... }

      setResultadosBusqueda(resultados);
      setMensajeError('');
    } catch (error) {
      console.error('Error al filtrar actuaciones:', error);
      setMensajeError(`Error al filtrar las actuaciones: ${error.message}`);
      setResultadosBusqueda([]);
    } finally {
      setCargando(false);
    }
  }, [actuaciones, busquedaForm]);

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
      {!cargando && vistaActual === 'listar' && actuaciones.length === 0 ? (
        <p>No hay actuaciones registradas.</p>
      ) : vistaActual === 'listar' ? (
        <TablaActuaciones
          actuaciones={actuaciones}
          cargando={cargando}
        />
      ) : null}
    </div>
  ), [actuaciones, mensajeError, cargando, vistaActual]);


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
        <TablaActuaciones
          actuaciones={resultadosBusqueda}
          cargando={cargando}
          titulo="Resultados de la Búsqueda"
        />
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && busquedaForm.descripcion_grabacion && (
        <p>No records to show.</p>
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && !busquedaForm.descripcion_grabacion && (
        <p>Fill the form and press "Search".</p>
      )}
    </div>
  ), [busquedaForm, ejecutarBusqueda, limpiarBusqueda, manejarCambioBusqueda, mensajeError, cargando, vistaActual, resultadosBusqueda]);


  // --- Efecto ---
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerActuaciones();
    }
  }, [vistaActual, obtenerActuaciones]);


  // --- Renderizado ---
  return (
    <div className="actuaciones-container">      
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
          {/* No hay opción de "Nuevo" para Actuaciones */}
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

export default Actuaciones;