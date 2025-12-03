// src/components/Masters.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Masters.css'; // Opcional: archivo de estilos

const API_BASE_URL = 'http://localhost:3001/api';

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

  // Estados para gestionar las master_canciones asociadas
  const [masterCancionesAsociadas, setMasterCancionesAsociadas] = useState([]);
  const [masterCancionesDisponibles, setMasterCancionesDisponibles] = useState([]);
  const [nuevaCancionSeleccionada, setNuevaCancionSeleccionada] = useState(''); // Para el select de añadir

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
                <th>ID</th>
                <th>Work</th>
                <th>Date</th>
                <th>Matrix Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {masters.map((master) => (
                <tr key={master.id}>
                  <td>{master.id}</td>
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
          <p>There's no songs associated to this master.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Song</th>
                <th>Master Descriptión</th>
                <th>Master length</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {canciones.map((mc) => (
                <tr key={mc.id}>
                  <td>{mc.id}</td>
                  <td>{mc.cancion ? mc.cancion.nombre : '-'}</td>
                  <td>{mc.descripcion || '-'}</td>
                  <td>{mc.duracion || '-'}</td>
                  <td>
                    {/* Botón para editar detalles específicos de la master_cancion si es necesario */}
                    {/* <button onClick={() => onEditarDetalle(mc)}>Editar Detalle</button> */}
                    <button
                      onClick={() => onEliminar(mc.id)}
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

  // Cargar master_canciones disponibles para el select de añadir
  const obtenerMasterCancionesDisponibles = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/master_canciones?sort=descripcion&order=ASC`);
      if (!response.ok) {
        throw new Error(`Error al obtener master_canciones disponibles: ${response.status}`);
      }
      const data = await response.json();
      setMasterCancionesDisponibles(data);
    } catch (error) {
      console.error('Error al cargar master_canciones disponibles para añadir:', error);
      setMasterCancionesDisponibles([]);
    }
  }, []);

  const manejarCambio = useCallback((e) => {
    const { name, value } = e.target;
    setMasterForm(prev => ({
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

  // Manejar cambios en la selección de canción para añadir
  const manejarCambioNuevaCancion = useCallback((e) => {
    setNuevaCancionSeleccionada(e.target.value);
  }, []);

  // Añadir una master_cancion a la lista temporal del formulario
  const anadirCancionAMaster = useCallback(() => {
    if (!nuevaCancionSeleccionada) {
      setMensajeError('Por favor, seleccione una canción para añadir.');
      return;
    }

    const cancionId = parseInt(nuevaCancionSeleccionada, 10);
    // Verificar si ya está en la lista
    if (masterCancionesAsociadas.some(mc => mc.id === cancionId)) {
      setMensajeError('Esta canción ya está asociada al master.');
      return;
    }

    // Buscar la canción completa en las disponibles
    const cancionCompleta = masterCancionesDisponibles.find(mc => mc.id === cancionId);
    if (cancionCompleta) {
      setMasterCancionesAsociadas(prev => [...prev, cancionCompleta]);
      setNuevaCancionSeleccionada(''); // Limpiar el select
      setMensajeError(''); // Limpiar mensaje de error si se añadió correctamente
    } else {
      setMensajeError('Canción seleccionada no encontrada.');
    }
  }, [nuevaCancionSeleccionada, masterCancionesAsociadas, masterCancionesDisponibles]);

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
    setNuevaCancionSeleccionada(''); // Limpiar selección de nueva canción
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
        <p>There's no registered masters.</p>
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
          Master title:
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
      {cargando && vistaActual === 'buscar' && <div className="loading">Buscando...</div>}

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
        <p>There's no data to show.</p>
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
            <option value="">-- Seleccione una obra --</option>
            {/* Deberías cargar las obras aquí, similar a como se hizo con canciones/sesiones */}
            {/* Por ahora, se asume que se manejan fuera o se deja como input de ID */}
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
          <h4>Master Songs</h4>
          <div className="anadir-cancion-form">
            <label>
              Add song:
              <select
                value={nuevaCancionSeleccionada}
                onChange={manejarCambioNuevaCancion}
              >
                <option value="">-- Select a song --</option>
                {masterCancionesDisponibles
                  .filter(mc => !masterCancionesAsociadas.some(assoc => assoc.id === mc.id)) // Filtrar las ya asociadas
                  .map(mc => (
                    <option key={mc.id} value={mc.id}>
                      {mc.descripcion || mc.cancion?.nombre || `Master Canción ID ${mc.id}`}
                    </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={anadirCancionAMaster} disabled={!nuevaCancionSeleccionada || cargando}>
              Add
            </button>
          </div>
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
          Cancel
        </button>
      </form>
    </div>
  ), [masterForm, mensajeError, cargando, esEdicion, vistaActual, manejarCambio, manejarSubmit, masterCancionesAsociadas, nuevaCancionSeleccionada, manejarCambioNuevaCancion, anadirCancionAMaster, quitarCancionDeMaster, masterCancionesDisponibles]);


  // --- Efectos ---
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerMasters();
    }
  }, [vistaActual, obtenerMasters]);

  // Cargar master_canciones disponibles cuando se monte el componente o se cambie a la vista de edición/creación
  useEffect(() => {
    if (vistaActual === 'nuevo') {
      obtenerMasterCancionesDisponibles();
    }
  }, [vistaActual, obtenerMasterCancionesDisponibles]);


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
              Nuevo
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