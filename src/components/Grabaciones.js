// src/components/Grabaciones.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Grabaciones.css'; // Opcional: archivo de estilos

const API_BASE_URL = 'http://localhost:3001/api';

const Grabaciones = () => {
  const [vistaActual, setVistaActual] = useState('listar');
  const [grabaciones, setGrabaciones] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaForm, setBusquedaForm] = useState({
    descripcion: '' // Campo de ejemplo para búsqueda
    // Puedes añadir más campos aquí en el futuro (cancion, sesion, tipo, fecha)
  });

  const [grabacionForm, setGrabacionForm] = useState({
    id: '',
    descripcion: '',
    cancion_id: '', // ID de la canción seleccionada
    tipo: 'Demo', // Valor por defecto
    duracion: '', // Formato HH:MM:SS o segundos como string
    fecha: '',
    lugar: '',
    publicacion: '', // Puede ser null
    soporte: '', // Puede ser null
    sesion_id: '', // ID de la sesión seleccionada
    // Campos específicos para cada tipo (se usarán condicionalmente)
    estudio: false, // Para Demo
    tipo_estudio: 'Toma', // Para Toma
    ordinal: '', // Para Toma (puede ser null)
    tipo_actuacion: 'Radio', // Para Actuación
    ordinal_actuacion: '', // Para Actuación (no puede ser null según modelo, pero lo dejamos como string vacío inicialmente)
    // No hay campos específicos extras para Entrevista en este ejemplo
  });

  // Estados para almacenar listas de canciones y sesiones
  const [canciones, setCanciones] = useState([]);
  const [sesiones, setSesiones] = useState([]);

  const [esEdicion, setEsEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // --- Componente Reutilizable TablaGrabaciones ---
  const TablaGrabaciones = useCallback(({ grabaciones, onEditar, onEliminar, cargando, titulo = "Grabaciones" }) => {
    return (
      <div className="tabla-grabaciones">
        {grabaciones.length === 0 ? (
          <p>No records to show.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Song</th>
                <th>Kind</th>
                <th>Date</th>
                <th>Session</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grabaciones.map((grabacion) => (
                <tr key={grabacion.id}>
                  <td>{grabacion.descripcion || '-'}</td>
                  <td>{grabacion.cancion ? grabacion.cancion.nombre : '-'}</td> {/* Muestra el nombre de la canción */}
                  <td>{grabacion.tipo}</td>
                  <td>{grabacion.fecha || '-'}</td>
                  <td>{grabacion.sesion ? grabacion.sesion.descripcion : '-'}</td> {/* Muestra la descripción de la sesión */}
                  <td>
                    <button
                      onClick={() => onEditar(grabacion)}
                      disabled={cargando}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onEliminar(grabacion.id)}
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

  const obtenerGrabaciones = useCallback(async () => {
    setCargando(true);
    setMensajeError('');
    try {
      const response = await fetch(`${API_BASE_URL}/grabaciones?sort=id&order=ASC`); // O sort=descripcion, etc.
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setGrabaciones(data);
    } catch (error) {
      console.error('Error al cargar grabaciones:', error);
      setMensajeError(`Error al cargar las grabaciones: ${error.message}`);
      setGrabaciones([]);
    } finally {
      setCargando(false);
    }
  }, []);

  // Cargar canciones y sesiones para los desplegables
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
      // Opcional: Mostrar mensaje de error o dejar la lista vacía
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
      // Opcional: Mostrar mensaje de error o dejar la lista vacía
    }
  }, []);

  // Cargar canciones y sesiones cuando el componente se monta
  useEffect(() => {
    obtenerCanciones();
    obtenerSesiones();
  }, [obtenerCanciones, obtenerSesiones]);

  const manejarCambio = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setGrabacionForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      const datosAPostear = { ...grabacionForm };
      if (!esEdicion) {
        delete datosAPostear.id;
      }

      // Dentro de manejarSubmit, justo antes de fetch
// ...
if (esEdicion) {
  // Actualización (PUT): Solo actualiza la tabla 'grabaciones'
  // NOTA: La lógica de actualización de tablas secundarias no está implementada aquí.
  // Se asume que el 'tipo' no cambia o se maneja aparte.
  const datosParaPut = { ...datosAPostear };
  // Elimina campos específicos del tipo que podrían estar en req.body
  // para evitar que Sequelize intente actualizar columnas inexistentes en la tabla 'grabaciones'
  delete datosParaPut.estudio; // Elimina campos específicos del tipo
  delete datosParaPut.tipo_estudio;
  delete datosParaPut.ordinal;
  delete datosParaPut.tipo_actuacion;
  delete datosParaPut.ordinal_actuacion;

  response = await fetch(`${API_BASE_URL}/grabaciones/${grabacionForm.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosParaPut),
  });
} else {
  // Creación (POST): Enviar todos los campos relevantes.
  // El backend (GrabacionesController.create) se encargará de usar solo los necesarios
  // según el valor de 'tipo' y creará el registro en la tabla secundaria correspondiente.
  // Solo limpiamos los campos específicos que no se deben enviar si están vacíos
  // y son obligatorios en la tabla secundaria (por ejemplo, ordinal_actuacion).
  // No es necesario reasignarlos a sí mismos.
  if (datosAPostear.tipo === 'Toma') {
    // Asegura que 'ordinal' sea null si el string está vacío, para que el backend lo maneje
    datosAPostear.ordinal = datosAPostear.ordinal || null;
  }
  // No se requiere limpieza adicional específica aquí para 'Demo' o 'Actuación'
  // basado en la lógica actual del backend (asume ordinal_actuacion es requerido y lo valida el usuario).

  response = await fetch(`${API_BASE_URL}/grabaciones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosAPostear), // Enviar el objeto completo con todos los campos
  });
}
// ...

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${esEdicion ? 'actualizar' : 'crear'} la grabación`);
      }

      const resultado = await response.json();
      console.log(`${esEdicion ? 'Actualizada' : 'Creada'} grabación:`, resultado);

      setGrabacionForm({
        id: '',
        descripcion: '',
        cancion_id: '',
        tipo: 'Demo',
        duracion: '',
        fecha: '',
        lugar: '',
        publicacion: '',
        soporte: '',
        sesion_id: '',
        estudio: false,
        tipo_estudio: 'Toma',
        ordinal: '',
        tipo_actuacion: 'Radio',
        ordinal_actuacion: ''
      });
      setEsEdicion(false);

      if (vistaActual === 'listar' || vistaActual === 'nuevo') {
        await obtenerGrabaciones(); // Refresca la lista completa
      }

    } catch (error) {
      console.error(`Error al ${esEdicion ? 'actualizar' : 'crear'} grabación:`, error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [esEdicion, grabacionForm, vistaActual, obtenerGrabaciones]);

  const cargarParaEditar = useCallback((grabacion) => {
    // Cargar datos generales
    setGrabacionForm({
      ...grabacion,
      cancion_id: grabacion.cancion ? grabacion.cancion.id : '', // Extraer ID
      sesion_id: grabacion.sesion ? grabacion.sesion.id : '', // Extraer ID
      // Inicializar campos específicos (esto es más complejo si se edita el tipo)
      // En este ejemplo, asumimos que al editar no se cambia el tipo, por lo tanto,
      // los campos específicos no se inicializan aquí directamente desde la grabación,
      // sino que se manejarían en el JSX del formulario si se permitiera cambiar el tipo.
      // Para simplificar, solo cargamos los campos generales y dejamos los específicos en blanco o con valores por defecto.
      // Si necesitas cargar los campos específicos, necesitarías una llamada adicional para obtener
      // el registro de la tabla secundaria correspondiente (Demo, Estudio, etc.).
      // Por ahora, solo cargamos los campos generales y dejamos el tipo como está.
      // Campos específicos se inicializan según el tipo cargado
      estudio: grabacion.tipo === 'Demo' ? (grabacion.estudio || false) : false, // Asumiendo que 'grabacion' tiene el campo de la tabla secundaria si se incluyó en el backend
      tipo_estudio: grabacion.tipo === 'Toma' ? (grabacion.tipo_estudio || 'Toma') : 'Toma',
      ordinal: grabacion.tipo === 'Toma' ? (grabacion.ordinal || '') : '',
      tipo_actuacion: grabacion.tipo === 'Actuación' ? (grabacion.tipo_actuacion || 'Radio') : 'Radio',
      ordinal_actuacion: grabacion.tipo === 'Actuación' ? (grabacion.ordinal_actuacion || '') : ''
    });
    setEsEdicion(true);
    setVistaActual('nuevo');
  }, []);

  const iniciarCreacion = useCallback(() => {
    setGrabacionForm({
      id: '',
      descripcion: '',
      cancion_id: '',
      tipo: 'Demo',
      duracion: '',
      fecha: '',
      lugar: '',
      publicacion: '',
      soporte: '',
      sesion_id: '',
      estudio: false,
      tipo_estudio: 'Toma',
      ordinal: '',
      tipo_actuacion: 'Radio',
      ordinal_actuacion: ''
    });
    setEsEdicion(false);
    setMensajeError('');
    setVistaActual('nuevo');
  }, []);

  const eliminarGrabacion = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta grabación y sus datos específicos asociados?')) {
      return;
    }

    setCargando(true);
    setMensajeError('');

    try {
      const response = await fetch(`${API_BASE_URL}/grabaciones/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar la grabación: ${response.status}`);
      }

      console.log('Grabación eliminada con id:', id);

      if (vistaActual === 'listar') {
        await obtenerGrabaciones(); // Refresca la lista completa
      }

    } catch (error) {
      console.error('Error al eliminar grabación:', error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [vistaActual, obtenerGrabaciones]);

  const ejecutarBusqueda = useCallback(() => {
    setCargando(true);
    setMensajeError('');

    try {
      let resultados = grabaciones;

      if (busquedaForm.descripcion) {
        resultados = resultados.filter(grabacion =>
          grabacion.descripcion.toLowerCase().includes(busquedaForm.descripcion.toLowerCase())
        );
      }
      // Puedes añadir más condiciones aquí para otros campos de búsqueda en el futuro
      // if (busquedaForm.tipo) { ... }
      // if (busquedaForm.fecha) { ... }

      setResultadosBusqueda(resultados);
      setMensajeError('');
    } catch (error) {
      console.error('Error al filtrar grabaciones:', error);
      setMensajeError(`Error al filtrar las grabaciones: ${error.message}`);
      setResultadosBusqueda([]);
    } finally {
      setCargando(false);
    }
  }, [grabaciones, busquedaForm]);

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
      {!cargando && vistaActual === 'listar' && grabaciones.length === 0 ? (
        <p>There's no records</p>
      ) : vistaActual === 'listar' ? (
        <TablaGrabaciones
          grabaciones={grabaciones}
          onEditar={cargarParaEditar}
          onEliminar={eliminarGrabacion}
          cargando={cargando}
        />
      ) : null}
    </div>
  ), [grabaciones, mensajeError, cargando, vistaActual, cargarParaEditar, eliminarGrabacion]);


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
        <TablaGrabaciones
          grabaciones={resultadosBusqueda}
          onEditar={cargarParaEditar}
          onEliminar={eliminarGrabacion}
          cargando={cargando}
          titulo="Resultados de la Búsqueda"
        />
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && busquedaForm.descripcion && (
        <p>Not found any record.</p>
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && !busquedaForm.descripcion && (
        <p>Fill the form and press "Search".</p>
      )}
    </div>
  ), [busquedaForm, ejecutarBusqueda, limpiarBusqueda, manejarCambioBusqueda, mensajeError, cargando, vistaActual, resultadosBusqueda, cargarParaEditar, eliminarGrabacion]);


  const VistaNuevo = useMemo(() => (
    <div className="vista-nuevo">
      <h3>{esEdicion ? 'Edit Recording' : 'New Recording'}</h3>
      {mensajeError && vistaActual === 'nuevo' && <div className="error-message">{mensajeError}</div>}
      <form onSubmit={manejarSubmit} className="grabacion-form">
        {esEdicion && <input type="hidden" name="id" value={grabacionForm.id} />}
        <label>
          Description:
          <input
            type="text"
            name="descripcion"
            value={grabacionForm.descripcion}
            onChange={manejarCambio}
          />
        </label>
        <label>
          Song:
          <select
            name="cancion_id"
            value={grabacionForm.cancion_id}
            onChange={manejarCambio}
          >
            <option value="">-- Select a song --</option>
            {canciones.map(cancion => (
              <option key={cancion.id} value={cancion.id}>{cancion.nombre}</option>
            ))}
          </select>
        </label>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <label>
            Time (MM:SS or seconds):
            <input
              type="text"
              name="duracion"
              value={grabacionForm.duracion}
              onChange={manejarCambio}
              style={{ width: "100px", textAlign: "center" }}
            />
          </label>
          <label>
            Date:
            <input
              type="date"
              name="fecha"
              value={grabacionForm.fecha}
              onChange={manejarCambio}
            />
          </label>
        </div>
        <label>
          Kind:
          <select
            name="tipo"
            value={grabacionForm.tipo}
            onChange={manejarCambio}
          >
            <option value="Demo">Demo</option>
            <option value="Toma">Toma</option>
            <option value="Actuación">Performance</option>
            <option value="Entrevista">Interview</option>
          </select>
        </label>

        {/* Campos específicos según el tipo */}
        {grabacionForm.tipo === 'Demo' && (
          <div className="campos-especificos">
            <h4>Demo details</h4>
            <label>
              ¿Is a studio demo?
              <input
                type="checkbox"
                name="estudio"
                checked={grabacionForm.estudio}
                onChange={manejarCambio}
              />
            </label>
          </div>
        )}

        {grabacionForm.tipo === 'Toma' && (
          <div className="campos-especificos">
            <h4>Take details</h4>
            <label>
              Kind of take:
              <select
                name="tipo_estudio"
                value={grabacionForm.tipo_estudio}
                onChange={manejarCambio}
              >
                <option value="Toma">Take</option>
                <option value="Overdub">Overdub</option>
                <option value="Toma+Overdub">Take+Overdub</option>
              </select>
            </label>
            <label>
              Take number (Ordinal):
              <input
                type="number"
                name="ordinal"
                value={grabacionForm.ordinal}
                onChange={manejarCambio}
                min="1" // Ajusta según sea necesario
              />
            </label>
          </div>
        )}

        {grabacionForm.tipo === 'Actuación' && (
          <div className="campos-especificos">
            <h4>Performance details</h4>
            <label>
              Kind of performance:
              <select
                name="tipo_actuacion"
                value={grabacionForm.tipo_actuacion}
                onChange={manejarCambio}
              >
                <option value="Radio">Radio</option>
                <option value="Concierto">Concert</option>
                <option value="TV">TV</option>
              </select>
            </label>
            <label>
              Number of performance (Ordinal):
              <input
                type="number"
                name="ordinal_actuacion"
                value={grabacionForm.ordinal_actuacion}
                onChange={manejarCambio}
                min="1" // Ajusta según sea necesario
                required // Si es obligatorio según el modelo
              />
            </label>
          </div>
        )}

        <label>
          Place:
          <input
            type="text"
            name="lugar"
            value={grabacionForm.lugar}
            onChange={manejarCambio}
          />
        </label>
        <label>
          Publish:
          <select
            name="publicacion"
            value={grabacionForm.publicacion}
            onChange={manejarCambio}
          >
            <option value="">-- Search status --</option>
            <option value="Existe_Sin_Publicar">Not published</option>
            <option value="Publico">Public</option>
            <option value="Oficial">Official</option>
          </select>
        </label>
        <label>
          Media:
          <select
            name="soporte"
            value={grabacionForm.soporte}
            onChange={manejarCambio}
          >
            <option value="">-- Select state media --</option>
            <option value="No_existe">Not exists</option>
            <option value="Existe_Sin_Publicar">Exists, but not published</option>
            <option value="Publico">Public</option>
            <option value="Oficial">Official</option>
          </select>
        </label>
        <label>
          Session:
          <select
            name="sesion_id"
            value={grabacionForm.sesion_id}
            onChange={manejarCambio}
          >
            <option value="">-- Select session --</option>
            {sesiones.map(sesion => (
              <option key={sesion.id} value={sesion.id}>{sesion.descripcion}</option>
            ))}
          </select>
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
  ), [grabacionForm, mensajeError, cargando, esEdicion, vistaActual, manejarCambio, manejarSubmit, canciones, sesiones]); // Añadir canciones y sesiones como dependencias


  // --- Efecto ---
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerGrabaciones();
    }
  }, [vistaActual, obtenerGrabaciones]);


  // --- Renderizado ---
  return (
    <div className="grabaciones-container">      
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

export default Grabaciones;