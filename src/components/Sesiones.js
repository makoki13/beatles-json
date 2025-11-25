// src/components/Sesiones.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Sesiones.css'; // Opcional: archivo de estilos

const API_BASE_URL = 'http://localhost:3001/api';

const Sesiones = () => {
  const [vistaActual, setVistaActual] = useState('listar');
  const [sesiones, setSesiones] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaForm, setBusquedaForm] = useState({
    descripcion: '' // Campo de ejemplo para búsqueda
    // Puedes añadir más campos aquí en el futuro (lugar, ciudad, pais, fecha)
  });

  const [sesionForm, setSesionForm] = useState({
    id: '',
    descripcion: '',
    lugar: '',
    ciudad: '',
    pais: '',
    fecha: '' // Formato YYYY-MM-DD
  });
  const [esEdicion, setEsEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // --- Componente Reutilizable TablaSesiones ---
  const TablaSesiones = useCallback(({ sesiones, onEditar, onEliminar, cargando }) => {
    return (
      <div className="tabla-sesiones">        
        {sesiones.length === 0 ? (
          <p>There's no data to show.</p>
        ) : (
          <table>
            <thead>
              <tr>                
                <th>Description</th>
                <th>Place</th>
                <th>City</th>
                <th>Country</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sesiones.map((sesion) => (
                <tr key={sesion.id}>                  
                  <td>{sesion.descripcion || '-'}</td>
                  <td>{sesion.lugar || '-'}</td>
                  <td>{sesion.ciudad || '-'}</td>
                  <td>{sesion.pais || '-'}</td>
                  <td>{sesion.fecha || '-'}</td>
                  <td>
                    <button
                      onClick={() => onEditar(sesion)}
                      disabled={cargando}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onEliminar(sesion.id)}
                      disabled={cargando}
                      className="eliminar-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }, []);


  // --- Funciones ---

  const obtenerSesiones = useCallback(async () => {
    setCargando(true);
    setMensajeError('');
    try {
      // Mantenemos el orden por ID al obtener todas (puedes cambiarlo si lo deseas)
      const response = await fetch(`${API_BASE_URL}/sesiones?sort=id&order=ASC`); // O sort=descripcion, etc.
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setSesiones(data);
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
      setMensajeError(`Error al cargar las sesiones: ${error.message}`);
      setSesiones([]);
    } finally {
      setCargando(false);
    }
  }, []);

  const manejarCambio = useCallback((e) => {
    const { name, value } = e.target;
    setSesionForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const manejarCambioBusqueda = useCallback((e) => {
    const { name, value } = e.target;
    setBusquedaForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const manejarSubmit = useCallback(async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeError('');

    try {
      let response;
      const datosAPostear = { ...sesionForm };
      if (!esEdicion) {
        delete datosAPostear.id;
      }

      if (esEdicion) {
        response = await fetch(`${API_BASE_URL}/sesiones/${sesionForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sesionForm),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/sesiones`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosAPostear),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${esEdicion ? 'actualizar' : 'crear'} la sesión`);
      }

      const resultado = await response.json();
      console.log(`${esEdicion ? 'Actualizada' : 'Creada'} sesión:`, resultado);

      setSesionForm({
        id: '',
        descripcion: '',
        lugar: '',
        ciudad: '',
        pais: '',
        fecha: ''
      });
      setEsEdicion(false);

      if (vistaActual === 'listar' || vistaActual === 'nuevo') {
        await obtenerSesiones(); // Refresca la lista completa
      }

    } catch (error) {
      console.error(`Error al ${esEdicion ? 'actualizar' : 'crear'} sesión:`, error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [esEdicion, sesionForm, vistaActual, obtenerSesiones]);

  const cargarParaEditar = useCallback((sesion) => {
    setSesionForm(sesion);
    setEsEdicion(true);
    setVistaActual('nuevo');
  }, []);

  const iniciarCreacion = useCallback(() => {
    setSesionForm({
      id: '',
      descripcion: '',
      lugar: '',
      ciudad: '',
      pais: '',
      fecha: ''
    });
    setEsEdicion(false);
    setMensajeError('');
    setVistaActual('nuevo');
  }, []);

  const eliminarSesion = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta sesión?')) {
      return;
    }

    setCargando(true);
    setMensajeError('');

    try {
      const response = await fetch(`${API_BASE_URL}/sesiones/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar la sesión: ${response.status}`);
      }

      console.log('Sesión eliminada con id:', id);

      if (vistaActual === 'listar') {
        await obtenerSesiones(); // Refresca la lista completa
      }

    } catch (error) {
      console.error('Error al eliminar sesión:', error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [vistaActual, obtenerSesiones]);

  const ejecutarBusqueda = useCallback(() => {
    setCargando(true);
    setMensajeError('');

    try {
      let resultados = sesiones;

      if (busquedaForm.descripcion) {
        resultados = resultados.filter(sesion =>
          sesion.descripcion.toLowerCase().includes(busquedaForm.descripcion.toLowerCase())
        );
      }
      // Puedes añadir más condiciones aquí para otros campos de búsqueda en el futuro
      // if (busquedaForm.lugar) { ... }
      // if (busquedaForm.fecha) { ... }

      setResultadosBusqueda(resultados);
      setMensajeError('');
    } catch (error) {
      console.error('Error al filtrar sesiones:', error);
      setMensajeError(`Error al filtrar las sesiones: ${error.message}`);
      setResultadosBusqueda([]);
    } finally {
      setCargando(false);
    }
  }, [sesiones, busquedaForm]);

  const limpiarBusqueda = useCallback(() => {
    setBusquedaForm({
      descripcion: ''
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
      {!cargando && vistaActual === 'listar' && sesiones.length === 0 ? (
        <p>No hay sesiones registradas.</p>
      ) : vistaActual === 'listar' ? (
        <TablaSesiones
          sesiones={sesiones}
          onEditar={cargarParaEditar}
          onEliminar={eliminarSesion}
          cargando={cargando}
        />
      ) : null}
    </div>
  ), [sesiones, mensajeError, cargando, vistaActual, cargarParaEditar, eliminarSesion]);


  const VistaBuscar = useMemo(() => (
    <div className="vista-buscar">      
      <form onSubmit={(e) => { e.preventDefault(); ejecutarBusqueda(); }} className="busqueda-form">
        <label>
          Description:
          <input
            type="text"
            name="descripcion"
            value={busquedaForm.descripcion}
            onChange={manejarCambioBusqueda}
          />
        </label>
        {/* Puedes añadir más campos de búsqueda aquí (lugar, ciudad, pais, fecha) */}
        <button type="submit" disabled={cargando}>Search</button>
        <button type="button" onClick={limpiarBusqueda} disabled={cargando}>Reset</button>
      </form>

      {mensajeError && vistaActual === 'buscar' && <div className="error-message">{mensajeError}</div>}
      {cargando && vistaActual === 'buscar' && <div className="loading">Buscando...</div>}

      {!cargando && vistaActual === 'buscar' && (
        <TablaSesiones
          sesiones={resultadosBusqueda}
          onEditar={cargarParaEditar}
          onEliminar={eliminarSesion}
          cargando={cargando}
          titulo="Resultados de la Búsqueda"
        />
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && busquedaForm.descripcion && (
        <p>No se encontraron sesiones que coincidan con la búsqueda.</p>
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && !busquedaForm.descripcion && (
        <p>Introduce string to look up and choose "Search".</p>
      )}
    </div>
  ), [busquedaForm, ejecutarBusqueda, limpiarBusqueda, manejarCambioBusqueda, mensajeError, cargando, vistaActual, resultadosBusqueda, cargarParaEditar, eliminarSesion]);


  const VistaNuevo = useMemo(() => (
    <div className="vista-nuevo">      
      {mensajeError && vistaActual === 'nuevo' && <div className="error-message">{mensajeError}</div>}
      <form onSubmit={manejarSubmit} className="sesion-form">
        {esEdicion && <input type="hidden" name="id" value={sesionForm.id} />}
        <label>
          Description:
          <input
            type="text"
            name="descripcion"
            value={sesionForm.descripcion}
            onChange={manejarCambio}
          />
        </label>
        <label>
          Place:
          <input
            type="text"
            name="lugar"
            value={sesionForm.lugar}
            onChange={manejarCambio}
          />
        </label>
        <label>
          City:
          <input
            type="text"
            name="ciudad"
            value={sesionForm.ciudad}
            onChange={manejarCambio}
          />
        </label>
        <label>
          Country:
          <input
            type="text"
            name="pais"
            value={sesionForm.pais}
            onChange={manejarCambio}
          />
        </label>
        <label>
          Date:
          <input
            type="date"
            name="fecha"
            value={sesionForm.fecha}
            onChange={manejarCambio}
          />
        </label>
        <button type="submit" disabled={cargando}>
          {esEdicion ? 'Update' : 'New'}
        </button>
        <button
          type="button"
          onClick={() => setVistaActual('listar')}
          disabled={cargando}
        >
          Cancel
        </button>
      </form>
    </div>
  ), [sesionForm, mensajeError, cargando, esEdicion, vistaActual, manejarCambio, manejarSubmit]);


  // --- Efecto ---
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerSesiones();
    }
  }, [vistaActual, obtenerSesiones]);


  // --- Renderizado ---
  return (
    <div className="sesiones-container">      
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
          <li>
            <button
              className={vistaActual === 'nuevo' ? 'active' : ''}
              onClick={iniciarCreacion}
            >
              New
            </button>
          </li>
        </ul>
      </nav>

      <main className="contenido-principal">
        {vistaActual === 'listar' && VistaListar}
        {vistaActual === 'buscar' && VistaBuscar}
        {vistaActual === 'nuevo' && VistaNuevo}
      </main>
    </div>
  );
};

export default Sesiones;