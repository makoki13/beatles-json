// src/components/Canciones.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Canciones.css'; // Opcional: archivo de estilos

const API_BASE_URL = 'http://localhost:3001/api';

const Canciones = () => {
  const [vistaActual, setVistaActual] = useState('listar');
  const [canciones, setCanciones] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaForm, setBusquedaForm] = useState({
    nombre: ''
    // Puedes añadir más campos aquí en el futuro (por ejemplo, hay_grabacion)
  });

  const [cancionForm, setCancionForm] = useState({
    id: '',
    nombre: '',
    nombres_alternativos: [], // Array de strings
    hay_grabacion: false
  });
  const [esEdicion, setEsEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // --- Componente Reutilizable TablaCanciones ---
  const TablaCanciones = useCallback(({ canciones, onEditar, onEliminar, cargando }) => {
    return (
      <div className="tabla-canciones">        
        {canciones.length === 0 ? (
          <p>There's no data to show.</p>
        ) : (
          <table>
            <thead>
              <tr>                
                <th>Title</th>
                <th>Alt. Title</th>
                <th>Was recorded?</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {canciones.map((cancion) => (
                <tr key={cancion.id}>                  
                  <td style={{textAlign:"left"}}>{cancion.nombre}</td>
                  <td style={{textAlign:"left"}}>{cancion.nombres_alternativos && cancion.nombres_alternativos.length > 0 ? canciones.nombres_alternativos.join(', ') : ''}</td> {/* Muestra los nombres alternativos unidos por coma, o '' si no hay */}
                  <td>{cancion.hay_grabacion ? 'Yes' : 'No'}</td>
                  <td>
                    <button
                      onClick={() => onEditar(cancion)}
                      disabled={cargando}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onEliminar(cancion.id)}
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
  }, []); // No depende de nada externo que cambie en renderizados


  // --- Funciones ---

  const obtenerCanciones = useCallback(async () => {
    setCargando(true);
    setMensajeError('');
    try {
      // Mantenemos el orden alfabético por nombre al obtener todos
      const response = await fetch(`${API_BASE_URL}/canciones?sort=nombre&order=ASC`);
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setCanciones(data);
    } catch (error) {
      console.error('Error al cargar canciones:', error);
      setMensajeError(`Error al cargar las canciones: ${error.message}`);
      setCanciones([]);
    } finally {
      setCargando(false);
    }
  }, []);

  const manejarCambio = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setCancionForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value // Maneja checkbox para hay_grabacion
    }));
  }, []);

  // Manejar cambios específicos para el array de nombres alternativos
  const manejarCambioNombresAlternativos = useCallback((e) => {
    const { value } = e.target;
    // Divide la cadena por comas y limpia espacios en blanco
    const nombresArray = value.split(',').map(nombre => nombre.trim()).filter(nombre => nombre !== '');
    setCancionForm(prev => ({
      ...prev,
      nombres_alternativos: nombresArray
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
      // Prepara los datos a enviar, excluyendo 'id' si es una creación nueva
      const datosAPostear = { ...cancionForm };
      if (!esEdicion) {
        delete datosAPostear.id;
      }

      if (esEdicion) {
        response = await fetch(`${API_BASE_URL}/canciones/${cancionForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cancionForm), // Puedes enviar canciónForm directamente
        });
      } else {
        response = await fetch(`${API_BASE_URL}/canciones`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosAPostear), // Enviar el objeto sin 'id'
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${esEdicion ? 'actualizar' : 'crear'} la canción`);
      }

      const resultado = await response.json();
      console.log(`${esEdicion ? 'Actualizada' : 'Creada'} canción:`, resultado);

      setCancionForm({
        id: '',
        nombre: '',
        nombres_alternativos: [],
        hay_grabacion: false
      });
      setEsEdicion(false);

      if (vistaActual === 'listar' || vistaActual === 'nuevo') {
        await obtenerCanciones(); // Refresca la lista completa
      }

    } catch (error) {
      console.error(`Error al ${esEdicion ? 'actualizar' : 'crear'} canción:`, error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [esEdicion, cancionForm, vistaActual, obtenerCanciones]);

  const cargarParaEditar = useCallback((cancion) => {
    // Asegúrate de que nombres_alternativos es un array, incluso si es null
    const nombresAlt = cancion.nombres_alternativos || [];
    setCancionForm({
      ...cancion,
      nombres_alternativos: nombresAlt // Asigna el array
    });
    setEsEdicion(true);
    setVistaActual('nuevo');
  }, []);

  const iniciarCreacion = useCallback(() => {
    setCancionForm({
      id: '',
      nombre: '',
      nombres_alternativos: [],
      hay_grabacion: false
    });
    setEsEdicion(false);
    setMensajeError('');
    setVistaActual('nuevo');
  }, []);

  const eliminarCancion = useCallback(async (id) => {
    if (!window.confirm('Are you sure to delete this song?')) {
      return;
    }

    setCargando(true);
    setMensajeError('');

    try {
      const response = await fetch(`${API_BASE_URL}/canciones/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar la canción: ${response.status}`);
      }

      console.log('Canción eliminada con id:', id);

      if (vistaActual === 'listar') {
        await obtenerCanciones(); // Refresca la lista completa
      }

    } catch (error) {
      console.error('Error al eliminar canción:', error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [vistaActual, obtenerCanciones]);

  const ejecutarBusqueda = useCallback(() => {
    setCargando(true);
    setMensajeError('');

    try {
      let resultados = canciones;

      if (busquedaForm.nombre) {
        resultados = resultados.filter(cancion =>
          cancion.nombre.toLowerCase().includes(busquedaForm.nombre.toLowerCase())
        );
      }
      // Puedes añadir más condiciones aquí para otros campos de búsqueda en el futuro
      // if (typeof busquedaForm.hay_grabacion === 'boolean') {
      //   resultados = resultados.filter(cancion => canción.hay_grabacion === busquedaForm.hay_grabacion);
      // }

      setResultadosBusqueda(resultados);
      setMensajeError('');
    } catch (error) {
      console.error('Error al filtrar canciones:', error);
      setMensajeError(`Error al filtrar las canciones: ${error.message}`);
      setResultadosBusqueda([]);
    } finally {
      setCargando(false);
    }
  }, [canciones, busquedaForm]);

  const limpiarBusqueda = useCallback(() => {
    setBusquedaForm({
      nombre: ''
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
      {!cargando && vistaActual === 'listar' && canciones.length === 0 ? (
        <p>No hay canciones registradas.</p>
      ) : vistaActual === 'listar' ? (
        <TablaCanciones
          canciones={canciones}
          onEditar={cargarParaEditar}
          onEliminar={eliminarCancion}
          cargando={cargando}
        />
      ) : null}
    </div>
  ), [canciones, mensajeError, cargando, vistaActual, cargarParaEditar, eliminarCancion]);


  const VistaBuscar = useMemo(() => (
    <div className="vista-buscar">      
      <form onSubmit={(e) => { e.preventDefault(); ejecutarBusqueda(); }} className="busqueda-form">
        <label>
          Title:
          <input
            type="text"
            name="nombre"
            value={busquedaForm.nombre}
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
        <TablaCanciones
          canciones={resultadosBusqueda}
          onEditar={cargarParaEditar}
          onEliminar={eliminarCancion}
          cargando={cargando}
          titulo="Resultados de la Búsqueda"
        />
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && busquedaForm.nombre && (
        <p>Not found any song.</p>
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && !busquedaForm.nombre && (
        <p>Fill the form and press "Search".</p>
      )}
    </div>
  ), [busquedaForm, ejecutarBusqueda, limpiarBusqueda, mensajeError, cargando, vistaActual, resultadosBusqueda, cargarParaEditar, eliminarCancion, manejarCambioBusqueda]);


  const VistaNuevo = useMemo(() => (
    <div className="vista-nuevo">      
      {mensajeError && vistaActual === 'nuevo' && <div className="error-message">{mensajeError}</div>}
      <form onSubmit={manejarSubmit} className="cancion-form">
        {esEdicion && <input type="hidden" name="id" value={cancionForm.id} />}
        <label>
          Title:
          <input
            type="text"
            name="nombre"
            value={cancionForm.nombre}
            onChange={manejarCambio}
            required
          />
        </label>
        <label>
          Alt Titles (separated with comma):
          <input
            type="text"
            name="nombres_alternativos"
            value={cancionForm.nombres_alternativos.join(', ')} // Convierte el array en string para mostrarlo
            onChange={manejarCambioNombresAlternativos} // Usa la función específica
          />
        </label>
        <label style={{display:"flex"}}>
          Was recorded?:
          <input
            type="checkbox"
            name="hay_grabacion"
            class="hay_grabacion"
            checked={cancionForm.hay_grabacion}
            onChange={manejarCambio} // Usa la función general, maneja checkbox
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
  ), [cancionForm, mensajeError, cargando, esEdicion, vistaActual, manejarCambio, manejarCambioNombresAlternativos, manejarSubmit]);


  // --- Efecto ---
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerCanciones();
    }
  }, [vistaActual, obtenerCanciones]); // Añade obtenerCanciones como dependencia


  // --- Renderizado ---
  return (
    <div className="canciones-container">      
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

export default Canciones;