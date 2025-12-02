// src/components/Remixes.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Remixes.css'; // Opcional: archivo de estilos

const API_BASE_URL = 'http://localhost:3001/api';

const Remixes = () => {
  const [vistaActual, setVistaActual] = useState('listar');
  const [remixes, setRemixes] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaForm, setBusquedaForm] = useState({
    descripcion: '' // Campo de ejemplo para búsqueda
    // Puedes añadir más campos aquí en el futuro (cancion, sesion, numero, publicada)
  });

  const [remixForm, setRemixForm] = useState({
    id: '',
    cancion_id: '', // ID de la canción seleccionada
    descripcion: '',
    numero: '', // Puede ser null
    tomas_ids: [], // Array de IDs de tomas seleccionadas
    sesion_id: '', // ID de la sesión seleccionada
    duracion: '', // Formato HH:MM:SS o segundos como string
    publicada: false,
    notas: ''
  });

  // Estados para almacenar listas de canciones, sesiones y tomas
  const [canciones, setCanciones] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [tomas, setTomas] = useState([]); // Toma: Grabaciones que son de tipo 'Toma' y están en Estudio

  const [esEdicion, setEsEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // --- Componente Reutilizable TablaRemixes ---
  const TablaRemixes = useCallback(({ remixes, onEditar, onEliminar, cargando, titulo = "Mezclas" }) => {
    return (
      <div className="tabla-remixes">        
        {remixes.length === 0 ? (
          <p>No hay datos para mostrar.</p>
        ) : (
          <table>
            <thead>
              <tr>                
                <th>Description</th>
                <th>Song</th>
                <th>Number</th>
                <th>Session</th>
                <th>¿Published?</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {remixes.map((remix) => (
                <tr key={remix.id}>                  
                  <td>{remix.descripcion || '-'}</td>
                  <td>{remix.cancion ? remix.cancion.nombre : '-'}</td>
                  <td>{remix.numero !== null && remix.numero !== undefined ? remix.numero : '-'}</td>
                  <td>{remix.sesion ? remix.sesion.descripcion : '-'}</td>
                  <td>{remix.publicada ? 'Sí' : 'No'}</td>
                  <td>
                    <button
                      onClick={() => onEditar(remix)}
                      disabled={cargando}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onEliminar(remix.id)}
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

  const obtenerRemixes = useCallback(async () => {
    setCargando(true);
    setMensajeError('');
    try {
      // Mantenemos el orden por ID al obtener todas (puedes cambiarlo si lo deseas)
      const response = await fetch(`${API_BASE_URL}/remixes?sort=id&order=ASC`); // O sort=descripcion, etc.
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setRemixes(data);
    } catch (error) {
      console.error('Error al cargar mezclas:', error);
      setMensajeError(`Error al cargar las mezclas: ${error.message}`);
      setRemixes([]);
    } finally {
      setCargando(false);
    }
  }, []);

  // Cargar canciones, sesiones y tomas para los desplegables
  const obtenerCanciones = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/canciones?sort=nombre&order=ASC`);
      if (!response.ok) {
        throw new Error(`Error al obtener canciones: ${response.status}`);
      }
      const data = await response.json();
      setCanciones(data);
    } catch (error) {
      console.error('Error al cargar canciones para el desplegable:', error);
    }
  }, []);

  const obtenerSesiones = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sesiones?sort=descripcion&order=ASC`);
      if (!response.ok) {
        throw new Error(`Error al obtener sesiones: ${response.status}`);
      }
      const data = await response.json();
      setSesiones(data);
    } catch (error) {
      console.error('Error al cargar sesiones para el desplegable:', error);
    }
  }, []);

  // Cargar tomas basadas en la canción seleccionada
  const obtenerTomasPorCancion = useCallback(async (cancionId) => {
    if (!cancionId) {
        setTomas([]); // Limpiar tomas si no hay canción seleccionada
        return;
    }
    try {
      // Obtiene grabaciones que son de tipo 'Toma' y están relacionadas con la canción
      // y que tienen un registro correspondiente en la tabla Estudio.
      // Esta lógica podría requerir una nueva ruta en el backend si no es trivial filtrarla allí.
      // Por simplicidad en el frontend, obtenemos todas las grabaciones de tipo 'Toma'
      // y luego filtramos por canción y existencia en Estudio si es posible desde aquí,
      // o mejor, crear una ruta específica en el backend como /api/remixes/tomas/:cancionId
      // Para este ejemplo, simularemos una llamada que filtre por canción en el backend.
      // Supongamos que hay una ruta /api/grabaciones/tomas/:cancionId
      // const response = await fetch(`${API_BASE_URL}/grabaciones/tomas/${cancionId}`);
      // En lugar de eso, obtenemos todas las grabaciones y luego filtramos y obtenemos estudios.
      // Este enfoque no es eficiente, lo ideal es filtrar en el backend.

      // Opción 1 (Menos eficiente, filtrado frontend): Obtener todas las grabaciones de tipo 'Toma' y sus estudios
      // const responseGrabaciones = await fetch(`${API_BASE_URL}/grabaciones?tipo=Toma`);
      // const responseEstudios = await fetch(`${API_BASE_URL}/estudios`);

      // Opción 2 (Más eficiente, recomendada): Crear una ruta específica en el backend
      // Ejemplo: GET /api/remixes/tomas_disponibles/:cancionId
      // Esta ruta debería devolver solo las grabaciones de tipo 'Toma' relacionadas con la canción y que existan en Estudio.
      // Por ahora, simulamos una llamada que *debería* filtrar en el backend.
      const response = await fetch(`${API_BASE_URL}/remixes/tomas_disponibles/${cancionId}`); // Ruta hipotética
      if (!response.ok) {
        throw new Error(`Error al obtener tomas disponibles: ${response.status}`);
      }
      const data = await response.json();
      setTomas(data); // data debería ser una lista de { id: id_grabacion, descripcion: ... }
    } catch (error) {
      console.error('Error al cargar tomas disponibles:', error);
      setTomas([]);
    }
  }, []);

  // Cargar canciones y sesiones cuando el componente se monta
  useEffect(() => {
    obtenerCanciones();
    obtenerSesiones();
  }, [obtenerCanciones, obtenerSesiones]);

  // Cargar tomas cuando cambia la canción seleccionada en el formulario
  useEffect(() => {
    obtenerTomasPorCancion(remixForm.cancion_id);
  }, [remixForm.cancion_id, obtenerTomasPorCancion]); // Añadir obtenerTomasPorCancion a las dependencias


  const manejarCambio = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setRemixForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Manejar cambio específico para el array de tomas_ids
  const manejarCambioTomas = useCallback((e) => {
    const { options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => parseInt(option.value, 10)); // Asegura que sean números enteros

    setRemixForm(prev => ({
      ...prev,
      tomas_ids: selectedValues
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
      const datosAPostear = { ...remixForm };
      if (!esEdicion) {
        delete datosAPostear.id;
      }

      if (esEdicion) {
        response = await fetch(`${API_BASE_URL}/remixes/${remixForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosAPostear),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/remixes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosAPostear),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${esEdicion ? 'actualizar' : 'crear'} la mezcla`);
      }

      const resultado = await response.json();
      console.log(`${esEdicion ? 'Actualizada' : 'Creada'} mezcla:`, resultado);

      setRemixForm({
        id: '',
        cancion_id: '',
        descripcion: '',
        numero: '',
        tomas_ids: [],
        sesion_id: '',
        duracion: '',
        publicada: false,
        notas: ''
      });
      setEsEdicion(false);

      if (vistaActual === 'listar' || vistaActual === 'nuevo') {
        await obtenerRemixes(); // Refresca la lista completa
      }

    } catch (error) {
      console.error(`Error al ${esEdicion ? 'actualizar' : 'crear'} mezcla:`, error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [esEdicion, remixForm, vistaActual, obtenerRemixes]);

  const cargarParaEditar = useCallback((remix) => {
    // Asegúrate de que tomas_ids es un array, incluso si es null
    const tomasIds = remix.tomas_ids || [];
    setRemixForm({
      ...remix,
      tomas_ids: tomasIds // Asigna el array
    });
    setEsEdicion(true);
    setVistaActual('nuevo');
  }, []);

  const iniciarCreacion = useCallback(() => {
    setRemixForm({
      id: '',
      cancion_id: '',
      descripcion: '',
      numero: '',
      tomas_ids: [],
      sesion_id: '',
      duracion: '',
      publicada: false,
      notas: ''
    });
    setEsEdicion(false);
    setMensajeError('');
    setVistaActual('nuevo');
  }, []);

  const eliminarRemix = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta mezcla?')) {
      return;
    }

    setCargando(true);
    setMensajeError('');

    try {
      const response = await fetch(`${API_BASE_URL}/remixes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar la mezcla: ${response.status}`);
      }

      console.log('Mezcla eliminada con id:', id);

      if (vistaActual === 'listar') {
        await obtenerRemixes(); // Refresca la lista completa
      }

    } catch (error) {
      console.error('Error al eliminar mezcla:', error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [vistaActual, obtenerRemixes]);

  const ejecutarBusqueda = useCallback(() => {
    setCargando(true);
    setMensajeError('');

    try {
      let resultados = remixes;

      if (busquedaForm.descripcion) {
        resultados = resultados.filter(remix =>
          remix.descripcion.toLowerCase().includes(busquedaForm.descripcion.toLowerCase())
        );
      }
      // Puedes añadir más condiciones aquí para otros campos de búsqueda en el futuro
      // if (typeof busquedaForm.publicada === 'boolean') { ... }
      // if (busquedaForm.numero) { ... }

      setResultadosBusqueda(resultados);
      setMensajeError('');
    } catch (error) {
      console.error('Error al filtrar mezclas:', error);
      setMensajeError(`Error al filtrar las mezclas: ${error.message}`);
      setResultadosBusqueda([]);
    } finally {
      setCargando(false);
    }
  }, [remixes, busquedaForm]);

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
      {!cargando && vistaActual === 'listar' && remixes.length === 0 ? (
        <p>No hay mezclas registradas.</p>
      ) : vistaActual === 'listar' ? (
        <TablaRemixes
          remixes={remixes}
          onEditar={cargarParaEditar}
          onEliminar={eliminarRemix}
          cargando={cargando}
        />
      ) : null}
    </div>
  ), [remixes, mensajeError, cargando, vistaActual, cargarParaEditar, eliminarRemix]);


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
        {/* Puedes añadir más campos de búsqueda aquí */}
        <button type="submit" disabled={cargando}>Search</button>
        <button type="button" onClick={limpiarBusqueda} disabled={cargando}>Reset</button>
      </form>

      {mensajeError && vistaActual === 'buscar' && <div className="error-message">{mensajeError}</div>}
      {cargando && vistaActual === 'buscar' && <div className="loading">Buscando...</div>}

      {!cargando && vistaActual === 'buscar' && (
        <TablaRemixes
          remixes={resultadosBusqueda}
          onEditar={cargarParaEditar}
          onEliminar={eliminarRemix}
          cargando={cargando}
          titulo="Resultados de la Búsqueda"
        />
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && busquedaForm.descripcion && (
        <p>No se encontraron mezclas que coincidan con la búsqueda.</p>
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && !busquedaForm.descripcion && (
        <p>Introduzca términos de búsqueda y pulse "Buscar".</p>
      )}
    </div>
  ), [busquedaForm, ejecutarBusqueda, limpiarBusqueda, manejarCambioBusqueda, mensajeError, cargando, vistaActual, resultadosBusqueda, cargarParaEditar, eliminarRemix]);


  const VistaNuevo = useMemo(() => (
    <div className="vista-nuevo">
      <h3>{esEdicion ? 'Edit remix' : 'New remix'}</h3>
      {mensajeError && vistaActual === 'nuevo' && <div className="error-message">{mensajeError}</div>}
      <form onSubmit={manejarSubmit} className="remix-form">
        {esEdicion && <input type="hidden" name="id" value={remixForm.id} />}
        <label>
          Song:
          <select
            name="cancion_id"
            value={remixForm.cancion_id}
            onChange={manejarCambio}
            required // Hacerlo obligatorio si es necesario
          >
            <option value="">-- Select a song --</option>
            {canciones.map(cancion => (
              <option key={cancion.id} value={cancion.id}>{cancion.nombre}</option>
            ))}
          </select>
        </label>
        <label>
          Description:
          <input
            type="text"
            name="descripcion"
            value={remixForm.descripcion}
            onChange={manejarCambio}
          />
        </label>
        <label>
          Number:
          <input
            type="number"
            name="numero"
            value={remixForm.numero}
            onChange={manejarCambio}
            min="1" // Ajusta según sea necesario
          />
        </label>
        <label>
          Take(s):
          <select
            name="tomas_ids"
            value={remixForm.tomas_ids} // Debe ser un array para selección múltiple
            onChange={manejarCambioTomas} // Usa la función específica
            multiple // Permite selección múltiple
            size="5" // Muestra 5 opciones sin hacer scroll (ajusta según necesites)
          >
            {tomas.map(toma => (
              <option key={toma.id} value={toma.id}>
                //{toma.descripcion || `Toma ID ${toma.id}`} {/* Muestra descripción o ID */}
                {toma.descripcion && `Toma ID ${toma.id}`}
              </option>
            ))}
          </select>
        </label>
        <label>
          Session:
          <select
            name="sesion_id"
            value={remixForm.sesion_id}
            onChange={manejarCambio}
          >
            <option value="">-- Select one or more sessions --</option>
            {sesiones.map(sesion => (
              <option key={sesion.id} value={sesion.id}>{sesion.descripcion}</option>
            ))}
          </select>
        </label>
        <label>
          Length (HH:MM:SS or seconds):
          <input
            type="text"
            name="duracion"
            value={remixForm.duracion}
            onChange={manejarCambio}
          />
        </label>
        <label>
          ¿Published?:
          <input
            type="checkbox"
            name="publicada"
            checked={remixForm.publicada}
            onChange={manejarCambio} // Usa la función general, maneja checkbox
          />
        </label>
        <label>
          Notes:
          <textarea
            name="notas"
            value={remixForm.notas}
            onChange={manejarCambio}
            rows="3" // Ajusta según necesites
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
  ), [remixForm, mensajeError, cargando, esEdicion, vistaActual, manejarCambio, manejarCambioTomas, manejarSubmit, canciones, sesiones, tomas]); // Añadir tomas como dependencia


  // --- Efecto ---
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerRemixes();
    }
  }, [vistaActual, obtenerRemixes]);


  // --- Renderizado ---
  return (
    <div className="remixes-container">      
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

export default Remixes;