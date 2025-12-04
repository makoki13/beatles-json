// src/components/Masters.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Masters.css'; // Opcional: archivo de estilos

const API_BASE_URL = 'http://localhost:3001/api';

// --- Añadir la función formatearDuracion aquí ---
  const formatearDuracion = (duracion) => {
    if (!duracion) return '-';
    if (typeof duracion === 'string') {
      // Si ya es un string (HH:MM:SS o similar), devuélvelo
      return duracion;
    }
    if (typeof duracion === 'object' && duracion.hours !== undefined) {
      // Si es un objeto { hours: ..., minutes: ..., seconds: ... } (intervalo de PG)
      const signo = duracion.hours < 0 ? '-' : '';
      const horasAbs = Math.abs(duracion.hours);
      const minutos = duracion.minutes || 0;
      const segundos = duracion.seconds || 0;
      return `${signo}${horasAbs.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }
    // Si es otro tipo, devolver como string o un valor por defecto
    return String(duracion);
  };
  // --- Fin Añadido ---

const Masters = () => {
  const [vistaActual, setVistaActual] = useState('listar');
  const [masters, setMasters] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaForm, setBusquedaForm] = useState({
    titulo_obra: '' // Campo de ejemplo para búsqueda
    // Puedes añadir más campos aquí en el futuro (fecha, matrix_number)
  });

  const [masterForm, setMasterForm] = useState({
    id: '',
    obra_id: '', // ID de la obra seleccionada
    fecha: '', // Formato YYYY-MM-DD
    matrix_number: ''
  });

  // --- Añadir estado para Obras ---
  const [obras, setObras] = useState([]);
  // --- Fin Añadir estado para Obras ---

  // Estados para gestionar las master_canciones asociadas
  const [masterCancionesAsociadas, setMasterCancionesAsociadas] = useState([]);
  // --- Estado para el formulario de nueva MasterCancion ---
  const [nuevaMasterCancionForm, setNuevaMasterCancionForm] = useState({
    cancion_id: '', // Opcional: ID de la canción original
    descripcion: '',
    duracion: '' // Formato HH:MM:SS o segundos como string
  });
  const [cancionesDisponibles, setCancionesDisponibles] = useState([]); // Opcional: para el select de cancion_id
  // --- Fin Estado para el formulario de nueva MasterCancion ---

  const [esEdicion, setEsEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // --- Componente Reutilizable TablaMasters ---
  const TablaMasters = useCallback(({ masters, onEditar, onEliminar, cargando, titulo = "Masters" }) => {
    return (
      <div className="tabla-masters">
        {masters.length === 0 ? (
          <p>There's no data to show.</p>
        ) : (
          <table>
            <thead>
              <tr>                
                <th>Work</th>
                <th>Date</th>
                <th>Matrix Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {masters.map((master) => (
                <tr key={master.id}>                  
                  <td>{master.obra ? master.obra.titulo : '-'}</td>
                  <td>{master.fecha || '-'}</td>
                  <td>{master.matrix_number || '-'}</td>
                  <td>
                    <button
                      onClick={() => onEditar(master)}
                      disabled={cargando}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onEliminar(master.id)}
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


  // --- Componente Reutilizable TablaMasterCancionesAsociadas ---
  const TablaMasterCancionesAsociadas = useCallback(({ canciones, onEliminar, cargando, titulo = "Canciones del Master" }) => {
    return (
      <div className="tabla-master-canciones">
        <h4>{titulo}</h4>
        {canciones.length === 0 ? (
          <p>There's no songs associated with this master.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Canción Original</th>
                <th>Descripción (Master)</th>
                <th>Duración (Master)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {canciones.map((mc) => (
                <tr key={mc.id}>
                  <td>{mc.id}</td>
                  <td>{mc.cancion ? mc.cancion.nombre : '-'}</td>
                  <td>{mc.descripcion || '-'}</td>
                  <td>{formatearDuracion(mc.duracion)}</td>
                  <td>
                    {/* Botón para editar detalles específicos de la master_cancion si es necesario */}
                    {/* <button onClick={() => onEditarDetalle(mc)}>Editar Detalle</button> */}
                    <button
                      onClick={() => onEliminar(mc.id)}
                      disabled={cargando}
                      className="eliminar-btn"
                    >
                      Quitar
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

  const obtenerMasters = useCallback(async () => {
    setCargando(true);
    setMensajeError('');
    try {
      const response = await fetch(`${API_BASE_URL}/masters?sort=id&order=ASC`); // O sort=obra.titulo, etc.
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setMasters(data);
    } catch (error) {
      console.error('Error al cargar masters:', error);
      setMensajeError(`Error al cargar los masters: ${error.message}`);
      setMasters([]);
    } finally {
      setCargando(false);
    }
  }, []);

  // --- Nueva Función: Cargar Obras ---
  const obtenerObras = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/obras?sort=titulo&order=ASC`);
      if (!response.ok) {
        throw new Error(`Error al obtener obras: ${response.status}`);
      }
      const data = await response.json();
      setObras(data); // Actualiza el estado con la lista de obras
    } catch (error) {
      console.error('Error al cargar obras para el desplegable:', error);
      setObras([]); // Asegura que el estado sea un array vacío en caso de error
      setMensajeError(`Error al cargar las obras: ${error.message}`);
    }
  }, []);
  // --- Fin Nueva Función ---

  // --- Nueva Función: Cargar Canciones (para el select opcional) ---
  const obtenerCanciones = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/canciones?sort=nombre&order=ASC`);
      if (!response.ok) {
        throw new Error(`Error al obtener canciones: ${response.status}`);
      }
      const data = await response.json();
      setCancionesDisponibles(data);
    } catch (error) {
      console.error('Error al cargar canciones para el desplegable de MasterCancion:', error);
      setCancionesDisponibles([]); // Asegura que el estado sea un array vacío en caso de error
      // Opcional: Mostrar mensaje de error al usuario
      // setMensajeError(`Error al cargar las canciones: ${error.message}`);
    }
  }, []);
  // --- Fin Nueva Función ---

  const manejarCambio = useCallback((e) => {
    const { name, value } = e.target;
    setMasterForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // --- Nueva Función: Manejar cambio en el formulario de nueva MasterCancion ---
  const manejarCambioNuevaMasterCancion = useCallback((e) => {
    const { name, value } = e.target;
    setNuevaMasterCancionForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  // --- Fin Nueva Función ---

  const manejarCambioBusqueda = useCallback((e) => {
    const { name, value } = e.target;
    setBusquedaForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // --- Nueva Función: Crear y Añadir una nueva MasterCancion ---
  const crearYAnadirCancionAMaster = useCallback(async () => {
    // Validar campos si es necesario antes de enviar
    if (!nuevaMasterCancionForm.descripcion) { // Ejemplo de validación mínima
      setMensajeError('La descripción es obligatoria para la canción del master.');
      return;
    }

    setCargando(true);
    setMensajeError('');
    try {
      // Llamar a la API para crear la nueva MasterCancion
      const response = await fetch(`${API_BASE_URL}/master_canciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaMasterCancionForm), // Enviar los datos del formulario
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la canción del master');
      }

      const nuevaCancion = await response.json();
      console.log('Creada nueva MasterCancion:', nuevaCancion);

      console.log('DEBUG: Nueva MasterCancion creada con ID:', nuevaCancion.id); // <-- Añadir este log
      console.log('DEBUG: Objeto completa de nueva MasterCancion:', nuevaCancion); // <-- Y este para ver la estructura
  
      // Añadir la nueva canción a la lista local de canciones asociadas al master
      setMasterCancionesAsociadas(prev => [...prev, nuevaCancion]);

      // Limpiar el formulario de nueva canción
      setNuevaMasterCancionForm({
        cancion_id: '',
        descripcion: '',
        duracion: ''
      });

      setMensajeError(''); // Limpiar mensaje de error si se añadió correctamente
    } catch (error) {
      console.error('Error al crear y añadir la canción del master:', error);
      setMensajeError(error.message);
    } finally {
      setCargando(false); // Asegurar que el estado de carga se restablece
    }
  }, [nuevaMasterCancionForm]);

  // Quitar una master_cancion de la lista temporal del formulario
  const quitarCancionDeMaster = useCallback((idCancion) => {
    setMasterCancionesAsociadas(prev => prev.filter(mc => mc.id !== idCancion));
  }, []);

  const manejarSubmit = useCallback(async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeError('');

    try {
      let response;
      const datosAPostear = {
        ...masterForm,
        // Enviar la lista de IDs de master_canciones asociadas
        master_canciones_ids: masterCancionesAsociadas.map(mc => mc.id)
      };
      if (!esEdicion) {
        delete datosAPostear.id;
      }

      if (esEdicion) {
        response = await fetch(`${API_BASE_URL}/masters/${masterForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosAPostear),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/masters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosAPostear),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${esEdicion ? 'actualizar' : 'crear'} el master`);
      }

      const resultado = await response.json();
      console.log(`${esEdicion ? 'Actualizado' : 'Creado'} master:`, resultado);

      setMasterForm({
        id: '',
        obra_id: '',
        fecha: '',
        matrix_number: ''
      });
      setMasterCancionesAsociadas([]); // Limpiar lista de canciones asociadas
      setNuevaMasterCancionForm({ // Limpiar también el formulario de nueva canción
        cancion_id: '',
        descripcion: '',
        duracion: ''
      });
      setEsEdicion(false);

      if (vistaActual === 'listar' || vistaActual === 'nuevo') {
        await obtenerMasters(); // Refresca la lista completa
      }

    } catch (error) {
      console.error(`Error al ${esEdicion ? 'actualizar' : 'crear'} master:`, error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [esEdicion, masterForm, masterCancionesAsociadas, vistaActual, obtenerMasters]);

  const cargarParaEditar = useCallback((master) => {
    setMasterForm({
      ...master,
      obra_id: master.obra ? master.obra.id : '' // Extraer ID
    });
    // Cargar las master_canciones asociadas al master
    setMasterCancionesAsociadas(master.master_canciones || []);
    setEsEdicion(true);
    setVistaActual('nuevo');
  }, []);

  const iniciarCreacion = useCallback(() => {
    setMasterForm({
      id: '',
      obra_id: '',
      fecha: '',
      matrix_number: ''
    });
    setMasterCancionesAsociadas([]); // Limpiar lista de canciones asociadas
    setNuevaMasterCancionForm({ // Limpiar formulario de nueva canción
      cancion_id: '',
      descripcion: '',
      duracion: ''
    });
    setEsEdicion(false);
    setMensajeError('');
    setVistaActual('nuevo');
  }, []);

  const eliminarMaster = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este master y sus asociaciones?')) {
      return;
    }

    setCargando(true);
    setMensajeError('');

    try {
      const response = await fetch(`${API_BASE_URL}/masters/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar el master: ${response.status}`);
      }

      console.log('Master eliminado con id:', id);

      if (vistaActual === 'listar') {
        await obtenerMasters(); // Refresca la lista completa
      }

    } catch (error) {
      console.error('Error al eliminar master:', error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [vistaActual, obtenerMasters]);

  const ejecutarBusqueda = useCallback(() => {
    setCargando(true);
    setMensajeError('');

    try {
      let resultados = masters;

      if (busquedaForm.titulo_obra) {
        resultados = resultados.filter(master =>
          master.obra && master.obra.titulo.toLowerCase().includes(busquedaForm.titulo_obra.toLowerCase())
        );
      }
      // Puedes añadir más condiciones aquí para otros campos de búsqueda en el futuro
      // if (busquedaForm.fecha) { ... }
      // if (busquedaForm.matrix_number) { ... }

      setResultadosBusqueda(resultados);
      setMensajeError('');
    } catch (error) {
      console.error('Error al filtrar masters:', error);
      setMensajeError(`Error al filtrar los masters: ${error.message}`);
      setResultadosBusqueda([]);
    } finally {
      setCargando(false);
    }
  }, [masters, busquedaForm]);

  const limpiarBusqueda = useCallback(() => {
    setBusquedaForm({
      titulo_obra: ''
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
      {!cargando && vistaActual === 'listar' && masters.length === 0 ? (
        <p>There's no master recordings.</p>
      ) : vistaActual === 'listar' ? (
        <TablaMasters
          masters={masters}
          onEditar={cargarParaEditar}
          onEliminar={eliminarMaster}
          cargando={cargando}
        />
      ) : null}
    </div>
  ), [masters, mensajeError, cargando, vistaActual, cargarParaEditar, eliminarMaster]);


  const VistaBuscar = useMemo(() => (
    <div className="vista-buscar">      
      <form onSubmit={(e) => { e.preventDefault(); ejecutarBusqueda(); }} className="busqueda-form">
        <label>
          Work Title:
          <input
            type="text"
            name="titulo_obra"
            value={busquedaForm.titulo_obra}
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
        <TablaMasters
          masters={resultadosBusqueda}
          onEditar={cargarParaEditar}
          onEliminar={eliminarMaster}
          cargando={cargando}
          titulo="Resultados de la Búsqueda"
        />
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && busquedaForm.titulo_obra && (
        <p>No se encontraron masters que coincidan con la búsqueda.</p>
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && !busquedaForm.titulo_obra && (
        <p>Fill the form and press "Search".</p>
      )}
    </div>
  ), [busquedaForm, ejecutarBusqueda, limpiarBusqueda, manejarCambioBusqueda, mensajeError, cargando, vistaActual, resultadosBusqueda, cargarParaEditar, eliminarMaster]);


  const VistaNuevo = useMemo(() => (
    <div className="vista-nuevo">
      <h3>{esEdicion ? 'Edit Master' : 'New Master'}</h3>
      {mensajeError && vistaActual === 'nuevo' && <div className="error-message">{mensajeError}</div>}
      <form onSubmit={manejarSubmit} className="master-form">
        {esEdicion && <input type="hidden" name="id" value={masterForm.id} />}
        <label>
          Work:
          <select
            name="obra_id"
            value={masterForm.obra_id}
            onChange={manejarCambio}
          >
            <option value="">-- Select a work --</option>
            {/* --- Cambio Aquí: Usar el estado 'obras' para generar las opciones --- */}
            {obras.map(obra => (
              <option key={obra.id} value={obra.id}>{obra.titulo}</option>
            ))}
            {/* --- Fin Cambio --- */}
          </select>
        </label>
        <label>
          Date:
          <input
            type="date"
            name="fecha"
            value={masterForm.fecha}
            onChange={manejarCambio}
          />
        </label>
        <label>
          Matrix Number:
          <input
            type="text"
            name="matrix_number"
            value={masterForm.matrix_number}
            onChange={manejarCambio}
          />
        </label>

        {/* Sección para gestionar MasterCanciones asociadas */}
        <div className="seccion-master-canciones">          
          {/* --- Nuevo Formulario: Crear Nueva MasterCancion --- */}
          <div className="crear-cancion-form">
            <h5>Add new master song</h5>
            <label>
              Original song:
              <select
                name="cancion_id"
                value={nuevaMasterCancionForm.cancion_id}
                onChange={manejarCambioNuevaMasterCancion}
              >
                <option value="">-- Seleccione una canción --</option>
                {/* Cargar canciones aquí si es necesario */}
                {cancionesDisponibles.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </label>
            <label>
              Description:
              <input
                type="text"
                name="descripcion"
                value={nuevaMasterCancionForm.descripcion}
                onChange={manejarCambioNuevaMasterCancion}
                required // Hacerlo obligatorio si es necesario
              />
            </label>
            <label>
              Length (HH:MM:SS or seconds):
              <input
                type="text"
                name="duracion"
                value={nuevaMasterCancionForm.duracion}
                onChange={manejarCambioNuevaMasterCancion}
              />
            </label>
            <button type="button" onClick={crearYAnadirCancionAMaster} disabled={cargando}>
              Add
            </button>
          </div>
          {/* --- Fin Nuevo Formulario --- */}
          <TablaMasterCancionesAsociadas
            canciones={masterCancionesAsociadas}
            onEliminar={quitarCancionDeMaster} // Esta función quita localmente
            cargando={cargando}
            titulo="Songs in this master"
          />
        </div>

        <button type="submit" disabled={cargando}>
          {esEdicion ? 'Update' : 'New'}
        </button>
        <button
          type="button"
          onClick={() => setVistaActual('listar')}
          disabled={cargando}
        >
          Cancelar
        </button>
      </form>
    </div>
  ), [masterForm, mensajeError, cargando, esEdicion, vistaActual, manejarCambio, manejarSubmit, obras, masterCancionesAsociadas, nuevaMasterCancionForm, manejarCambioNuevaMasterCancion, crearYAnadirCancionAMaster, cancionesDisponibles, quitarCancionDeMaster]); // Añadir nuevas dependencias


  // --- Efectos ---
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerMasters();
    }
  }, [vistaActual, obtenerMasters]);

  // --- Nuevo Efecto: Cargar Obras ---
  useEffect(() => {
    if ((vistaActual === 'nuevo' || vistaActual === 'listar') && obras.length === 0) {
         obtenerObras();
    }
  }, [vistaActual, obras.length, obtenerObras]);
  // --- Fin Nuevo Efecto ---

  // --- Nuevo Efecto: Cargar Canciones para el select de nueva MasterCancion ---
  useEffect(() => {
    if (vistaActual === 'nuevo') { // Cargar canciones cuando se entre a la vista de nuevo/editar
      obtenerCanciones();
    }
  }, [vistaActual, obtenerCanciones]);
  // --- Fin Nuevo Efecto ---


  // --- Renderizado ---
  return (
    <div className="masters-container">
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

export default Masters;