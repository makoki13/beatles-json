// src/components/Demos.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Demos.css'; // Opcional: archivo de estilos

const API_BASE_URL = 'http://localhost:3001/api';

const Demos = () => {
  const [vistaActual, setVistaActual] = useState('listar'); // Solo listar y buscar
  const [demos, setDemos] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaForm, setBusquedaForm] = useState({
    descripcion_grabacion: '' // Campo de ejemplo para búsqueda
    // Puedes añadir más campos aquí en el futuro (tipo, fecha, lugar, estudio)
  });

  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // --- Componente Reutilizable TablaDemos ---
  const TablaDemos = useCallback(({ demos, cargando, titulo = "Demos" }) => {
    return (
      <div className="tabla-demos">        
        {demos.length === 0 ? (
          <p>No records to show.</p>
        ) : (
          <table>
            <thead>
              <tr>                
                <th>Recording Description</th>
                <th>Kind</th>
                <th>Date</th>
                <th>Place</th>
                <th>Studio?</th>
                {/* No hay botones de Editar/Borrar en esta vista */}
              </tr>
            </thead>
            <tbody>
              {demos.map((demo) => (
                <tr key={demo.id_grabacion}>                  
                  <td>{demo.grabacion ? demo.grabacion.descripcion : '-'}</td>
                  <td>{demo.grabacion ? demo.grabacion.tipo : '-'}</td>
                  <td>{demo.grabacion ? demo.grabacion.fecha : '-'}</td>
                  <td>{demo.grabacion ? demo.grabacion.lugar : '-'}</td>
                  <td>{demo.estudio ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }, []);


  // --- Funciones ---

  const obtenerDemos = useCallback(async () => {
    setCargando(true);
    setMensajeError('');
    try {
      const response = await fetch(`${API_BASE_URL}/demos?sort=id_grabacion&order=ASC`); // O sort=grabacion.descripcion, etc.
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setDemos(data);
    } catch (error) {
      console.error('Error al cargar demos:', error);
      setMensajeError(`Error al cargar las demos: ${error.message}`);
      setDemos([]);
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
      let resultados = demos;

      if (busquedaForm.descripcion_grabacion) {
        resultados = resultados.filter(demo =>
          demo.grabacion && demo.grabacion.descripcion.toLowerCase().includes(busquedaForm.descripcion_grabacion.toLowerCase())
        );
      }
      // Puedes añadir más condiciones aquí para otros campos de búsqueda en el futuro
      // if (typeof busquedaForm.estudio === 'boolean') { ... }
      // if (busquedaForm.fecha_grabacion) { ... }

      setResultadosBusqueda(resultados);
      setMensajeError('');
    } catch (error) {
      console.error('Error al filtrar demos:', error);
      setMensajeError(`Error al filtrar las demos: ${error.message}`);
      setResultadosBusqueda([]);
    } finally {
      setCargando(false);
    }
  }, [demos, busquedaForm]);

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
      {!cargando && vistaActual === 'listar' && demos.length === 0 ? (
        <p>No hay demos registradas.</p>
      ) : vistaActual === 'listar' ? (
        <TablaDemos
          demos={demos}
          cargando={cargando}
        />
      ) : null}
    </div>
  ), [demos, mensajeError, cargando, vistaActual]);


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
      {cargando && vistaActual === 'buscar' && <div className="loading">Buscando...</div>}

      {!cargando && vistaActual === 'buscar' && (
        <TablaDemos
          demos={resultadosBusqueda}
          cargando={cargando}
          titulo="Resultados de la Búsqueda"
        />
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && busquedaForm.descripcion_grabacion && (
        <p>No se encontraron demos que coincidan con la búsqueda.</p>
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && !busquedaForm.descripcion_grabacion && (
        <p>Fill the form and press "Search".</p>
      )}
    </div>
  ), [busquedaForm, ejecutarBusqueda, limpiarBusqueda, manejarCambioBusqueda, mensajeError, cargando, vistaActual, resultadosBusqueda]);


  // --- Efecto ---
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerDemos();
    }
  }, [vistaActual, obtenerDemos]);


  // --- Renderizado ---
  return (
    <div className="demos-container">      
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
          {/* No hay opción de "Nuevo" para Demos */}
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

export default Demos;