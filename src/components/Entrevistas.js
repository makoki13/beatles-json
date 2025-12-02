// src/components/Entrevistas.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Entrevistas.css'; // Opcional: archivo de estilos

const API_BASE_URL = 'http://localhost:3001/api';

const Entrevistas = () => {
  const [vistaActual, setVistaActual] = useState('listar'); // Solo listar y buscar
  const [entrevistas, setEntrevistas] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaForm, setBusquedaForm] = useState({
    descripcion_grabacion: '' // Campo de ejemplo para búsqueda
    // Puedes añadir más campos aquí en el futuro (tipo, fecha, lugar)
  });

  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // --- Componente Reutilizable TablaEntrevistas ---
  const TablaEntrevistas = useCallback(({ entrevistas, cargando, titulo = "Entrevistas" }) => {
    return (
      <div className="tabla-entrevistas">        
        {entrevistas.length === 0 ? (
          <p>No data to show.</p>
        ) : (
          <table>
            <thead>
              <tr>                
                <th>Record Description</th>
                <th>Kind</th>
                <th>Date</th>
                <th>Place</th>
                {/* No hay campos específicos de Entrevista, solo mostrar la info de la grabación */}
                {/* No hay botones de Editar/Borrar en esta vista */}
              </tr>
            </thead>
            <tbody>
              {entrevistas.map((entrevista) => (
                <tr key={entrevista.id_grabacion}>                  
                  <td>{entrevista.grabacion ? entrevista.grabacion.descripcion : '-'}</td>
                  <td>{entrevista.grabacion ? entrevista.grabacion.tipo : '-'}</td>
                  <td>{entrevista.grabacion ? entrevista.grabacion.fecha : '-'}</td>
                  <td>{entrevista.grabacion ? entrevista.grabacion.lugar : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }, []);


  // --- Funciones ---

  const obtenerEntrevistas = useCallback(async () => {
    setCargando(true);
    setMensajeError('');
    try {
      const response = await fetch(`${API_BASE_URL}/entrevistas?sort=id_grabacion&order=ASC`); // O sort=grabacion.descripcion, etc.
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setEntrevistas(data);
    } catch (error) {
      console.error('Error al cargar entrevistas:', error);
      setMensajeError(`Error al cargar las entrevistas: ${error.message}`);
      setEntrevistas([]);
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
      let resultados = entrevistas;

      if (busquedaForm.descripcion_grabacion) {
        resultados = resultados.filter(entrevista =>
          entrevista.grabacion && entrevista.grabacion.descripcion.toLowerCase().includes(busquedaForm.descripcion_grabacion.toLowerCase())
        );
      }
      // Puedes añadir más condiciones aquí para otros campos de búsqueda en el futuro
      // if (busquedaForm.fecha_grabacion) { ... }

      setResultadosBusqueda(resultados);
      setMensajeError('');
    } catch (error) {
      console.error('Error al filtrar entrevistas:', error);
      setMensajeError(`Error al filtrar las entrevistas: ${error.message}`);
      setResultadosBusqueda([]);
    } finally {
      setCargando(false);
    }
  }, [entrevistas, busquedaForm]);

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
      {!cargando && vistaActual === 'listar' && entrevistas.length === 0 ? (
        <p>There's no registered interviews.</p>
      ) : vistaActual === 'listar' ? (
        <TablaEntrevistas
          entrevistas={entrevistas}
          cargando={cargando}
        />
      ) : null}
    </div>
  ), [entrevistas, mensajeError, cargando, vistaActual]);


  const VistaBuscar = useMemo(() => (
    <div className="vista-buscar">      
      <form onSubmit={(e) => { e.preventDefault(); ejecutarBusqueda(); }} className="busqueda-form">
        <label>
          Record description:
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
        <TablaEntrevistas
          entrevistas={resultadosBusqueda}
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
      obtenerEntrevistas();
    }
  }, [vistaActual, obtenerEntrevistas]);


  // --- Renderizado ---
  return (
    <div className="entrevistas-container">      
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
          {/* No hay opción de "Nuevo" para Entrevistas */}
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

export default Entrevistas;