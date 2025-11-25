// src/components/Personajes.js
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Añade useMemo
import './Personajes.css';

const API_BASE_URL = 'http://localhost:3001/api';

const Personajes = () => {
  const [vistaActual, setVistaActual] = useState('listar');
  const [personajes, setPersonajes] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]); // Resultados filtrados para la vista de búsqueda
  const [busquedaForm, setBusquedaForm] = useState({ // Estado para los términos de búsqueda
    nombre: ''
    // Puedes añadir más campos aquí en el futuro (fecha_nacimiento, lugar_nacimiento, etc.)
  });
  const [personajeForm, setPersonajeForm] = useState({
    id: '', // Añadido para manejar la edición
    nombre: '',
    fecha_nacimiento: '',
    lugar_nacimiento: '',
    fecha_fallecimiento: '',
    lugar_fallecimiento: ''
  });
  const [esEdicion, setEsEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  /* const obtenerPersonajes = useCallback(async () => { // Memoriza esta función también
    setCargando(true);
    setMensajeError('');
    try {
      const response = await fetch(`${API_BASE_URL}/personajes`);
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setPersonajes(data);
    } catch (error) {
      console.error('Error al cargar personajes:', error);
      setMensajeError(`Error al cargar los personajes: ${error.message}`);
      setPersonajes([]);
    } finally {
      setCargando(false);
    }
  }, []); // No depende de nada externo que cambie en renderizados */

  // ... (otros imports e inicialización de estado)
  const TablaPersonajes = useCallback(({ personajes, onEditar, onEliminar, cargando, titulo = "Personajes" }) => {
    return (
      <div className="tabla-personajes">
        <h3>{titulo}</h3>
        {personajes.length === 0 ? (
          <p>There's no data to show.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Fecha Nacimiento</th>
                <th>Lugar Nacimiento</th>
                <th>Fecha Fallecimiento</th>
                <th>Lugar Fallecimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personajes.map((personaje) => (
                <tr key={personaje.id}>
                  <td>{personaje.id}</td>
                  <td>{personaje.nombre}</td>
                  <td>{personaje.fecha_nacimiento || '-'}</td>
                  <td>{personaje.lugar_nacimiento || '-'}</td>
                  <td>{personaje.fecha_fallecimiento || '-'}</td>
                  <td>{personaje.lugar_fallecimiento || '-'}</td>
                  <td>
                    <button
                      onClick={() => onEditar(personaje)}
                      disabled={cargando}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onEliminar(personaje.id)}
                      disabled={cargando}
                      className="eliminar-btn"
                    >
                      Borrar
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

  const obtenerPersonajes = useCallback(async () => { // También es buena práctica memorizar esta función si depende de API_BASE_URL
    setCargando(true);
    setMensajeError('');
    try {
      // --- Cambio Aquí ---
      // Añadir parámetros de ordenación a la URL
      const response = await fetch(`${API_BASE_URL}/personajes?sort=nombre&order=ASC`);
      // --- Fin Cambio ---
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setPersonajes(data);
    } catch (error) {
      console.error('Error al cargar personajes:', error);
      setMensajeError(`Error al cargar los personajes: ${error.message}`);
      setPersonajes([]);
    } finally {
      setCargando(false);
    }
  }, []); // Añadir API_BASE_URL si no es una constante global

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
      // Filtrar la lista completa de personajes basándose en los términos de búsqueda
      // Este filtrado se hace localmente en el frontend
      let resultados = personajes; // Empezamos con la lista completa

      if (busquedaForm.nombre) {
        resultados = resultados.filter(personaje =>
          personaje.nombre.toLowerCase().includes(busquedaForm.nombre.toLowerCase())
        );
      }
      // Puedes añadir más condiciones aquí para otros campos de búsqueda en el futuro
      // if (busquedaForm.fecha_nacimiento) { ... }
      // if (busquedaForm.lugar_nacimiento) { ... }

      setResultadosBusqueda(resultados); // Guardamos los resultados filtrados
      setMensajeError(''); // Limpiar error si la búsqueda es exitosa
    } catch (error) {
      console.error('Error al filtrar personajes:', error);
      setMensajeError(`Error al filtrar los personajes: ${error.message}`);
      setResultadosBusqueda([]); // Limpiar resultados en caso de error
    } finally {
      setCargando(false);
    }
  }, [personajes, busquedaForm]); // Dependencias: personajes y busquedaForm

  const limpiarBusqueda = useCallback(() => {
    setBusquedaForm({
      nombre: ''
      // Reinicia otros campos de búsqueda si los añades
    });
    setResultadosBusqueda([]); // Limpiar resultados
    setMensajeError(''); // Limpiar mensaje de error
  }, []);

// ... (resto del componente, useEffect, funciones, y JSX)
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerPersonajes();
    }
  }, [vistaActual, obtenerPersonajes]); // Añade obtenerPersonajes como dependencia

  // Memoriza manejarCambio
  const manejarCambio = useCallback((e) => {
    const { name, value } = e.target;
    setPersonajeForm(prev => ({
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
    // --- Cambio Aquí ---
    // Prepara los datos a enviar, excluyendo 'id' si es una creación nueva
    const datosAPostear = { ...personajeForm }; // Copia el objeto
    if (!esEdicion) {
      delete datosAPostear.id; // Elimina 'id' solo si es una creación nueva
    }
    // --- Fin Cambio ---

    if (esEdicion) {
      // Actualizar un personaje existente (PUT)
      // Aquí SÍ necesitas el id para especificar qué registro actualizar
      response = await fetch(`${API_BASE_URL}/personajes/${personajeForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personajeForm), // Puedes enviar personajeForm directamente aquí
      });
    } else {
      // Crear un nuevo personaje (POST)
      // Enviamos los datos sin el 'id'
      response = await fetch(`${API_BASE_URL}/personajes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // --- Cambio Aquí ---
        body: JSON.stringify(datosAPostear), // Enviar el objeto sin 'id'
        // --- Fin Cambio ---
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error al ${esEdicion ? 'actualizar' : 'crear'} el personaje`);
    }

    const resultado = await response.json();
    console.log(`${esEdicion ? 'Actualizado' : 'Creado'} personaje:`, resultado);

    setPersonajeForm({
      id: '', // Reinicia el id a vacío para futuras operaciones
      nombre: '',
      fecha_nacimiento: '',
      lugar_nacimiento: '',
      fecha_fallecimiento: '',
      lugar_fallecimiento: ''
    });
    setEsEdicion(false);

    if (vistaActual === 'listar' || vistaActual === 'nuevo') {
      await obtenerPersonajes();
    }
    // Opcional: Cambiar la vista a 'listar' después de crear/actualizar
    setVistaActual('listar');

  } catch (error) {
    console.error(`Error al ${esEdicion ? 'actualizar' : 'crear'} personaje:`, error);
    setMensajeError(error.message);
  } finally {
    setCargando(false);
  }
}, [esEdicion, personajeForm, vistaActual, obtenerPersonajes]); // Asegúrate de que las dependencias sean correctas

// ... (mantén el resto de las funciones y el JSX como están, incluido el uso de useMemo)

  const cargarParaEditar = useCallback((personaje) => { // Memoriza esta función también
    setPersonajeForm(personaje);
    setEsEdicion(true);
    setVistaActual('nuevo');
  }, []);

  const iniciarCreacion = useCallback(() => { // Memoriza esta función también
    setPersonajeForm({
      id: '',
      nombre: '',
      fecha_nacimiento: '',
      lugar_nacimiento: '',
      fecha_fallecimiento: '',
      lugar_fallecimiento: ''
    });
    setEsEdicion(false);
    setMensajeError('');
    setVistaActual('nuevo');
  }, []);

  const eliminarPersonaje = useCallback(async (id) => { // Memoriza esta función también
    if (!window.confirm('¿Estás seguro de que deseas eliminar este personaje?')) {
      return;
    }

    setCargando(true);
    setMensajeError('');

    try {
      const response = await fetch(`${API_BASE_URL}/personajes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar el personaje: ${response.status}`);
      }

      console.log('Personaje eliminado con id:', id);

      if (vistaActual === 'listar') {
        await obtenerPersonajes();
      }

    } catch (error) {
      console.error('Error al eliminar personaje:', error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [vistaActual, obtenerPersonajes]);

  // --- Componentes de Vista Memorizados ---

  // VistaListar: No depende de estados del formulario, memorizarla puede ser útil si cambia mucho vistaActual
  const VistaListar = useMemo(() => (
    <div className="vista-listar">      
      {mensajeError && vistaActual === 'listar' && <div className="error-message">{mensajeError}</div>}
      {cargando && vistaActual === 'listar' && <div className="loading">Loading...</div>}
      {!cargando && vistaActual === 'listar' && personajes.length === 0 ? (
        <p>There's no people recorded.</p>
      ) : vistaActual === 'listar' ? (
        <table className="tabla-personajes">
          <thead>
            <tr>
              <th>Name</th>
              <th>Born date</th>
              <th>Born place</th>
              <th>Pass date</th>
              <th>Pass place</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {personajes.map((personaje) => (
              <tr key={personaje.id}>                
                <td>{personaje.nombre}</td>
                <td>{personaje.fecha_nacimiento || '-'}</td>
                <td>{personaje.lugar_nacimiento || '-'}</td>
                <td>{personaje.fecha_fallecimiento || '-'}</td>
                <td>{personaje.lugar_fallecimiento || '-'}</td>
                <td>
                  <button
                    onClick={() => cargarParaEditar(personaje)}
                    disabled={cargando}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => eliminarPersonaje(personaje.id)}
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
      ) : null}
    </div>
  ), [personajes, mensajeError, cargando, vistaActual, cargarParaEditar, eliminarPersonaje]); // Dependencias relevantes para VistaListar


  // VistaBuscar: Por ahora es simple, pero puedes memorizarla también si crece
  const VistaBuscar = useMemo(() => (
    <div className="vista-buscar">
      <h3>Search form</h3>
      <form onSubmit={(e) => { e.preventDefault(); ejecutarBusqueda(); }} className="busqueda-form">
        <label>
          Name:
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
      {cargando && vistaActual === 'buscar' && <div className="loading">Searching...</div>}

      {/* Mostrar resultados solo si no está cargando y hay algo que mostrar */}
      {!cargando && vistaActual === 'buscar' && (
        <TablaPersonajes
          personajes={resultadosBusqueda}
          onEditar={cargarParaEditar} // Reutilizamos las mismas funciones de editar/eliminar
          onEliminar={eliminarPersonaje}
          cargando={cargando}
          titulo="Search results" // Título opcional para la tabla en esta vista
        />
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && busquedaForm.nombre && (
        <p>There's no people found in the search.</p>
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && !busquedaForm.nombre && (
        <p>Fill the form and choose "Search".</p>
      )}
    </div>
  ), [busquedaForm, ejecutarBusqueda, manejarCambioBusqueda, limpiarBusqueda, mensajeError, cargando, vistaActual, resultadosBusqueda, cargarParaEditar, eliminarPersonaje]); // Añadir dependencias


  // VistaNuevo: Esta es la clave para mantener el foco
  const VistaNuevo = useMemo(() => (
    <div className="vista-nuevo">
      <h3>{esEdicion ? 'Editar Personaje' : 'Nuevo Personaje'}</h3>
      {mensajeError && vistaActual === 'nuevo' && <div className="error-message">{mensajeError}</div>}
      <form onSubmit={manejarSubmit} className="personaje-form">
        {/* Añadimos un campo oculto para el ID en modo edición si es necesario para la API */}
        {esEdicion && <input type="hidden" name="id" value={personajeForm.id} />}
        <label>
          Nombre:
          <input
            type="text"
            name="nombre"
            value={personajeForm.nombre}
            onChange={manejarCambio} // Pasa la función memorizada
            required
          />
        </label>
        <label>
          Fecha de Nacimiento:
          <input
            type="date"
            name="fecha_nacimiento"
            value={personajeForm.fecha_nacimiento}
            onChange={manejarCambio} // Pasa la función memorizada
          />
        </label>
        <label>
          Lugar de Nacimiento:
          <input
            type="text"
            name="lugar_nacimiento"
            value={personajeForm.lugar_nacimiento}
            onChange={manejarCambio} // Pasa la función memorizada
          />
        </label>
        <label>
          Fecha de Fallecimiento:
          <input
            type="date"
            name="fecha_fallecimiento"
            value={personajeForm.fecha_fallecimiento}
            onChange={manejarCambio} // Pasa la función memorizada
          />
        </label>
        <label>
          Lugar de Fallecimiento:
          <input
            type="text"
            name="lugar_fallecimiento"
            value={personajeForm.lugar_fallecimiento}
            onChange={manejarCambio} // Pasa la función memorizada
          />
        </label>
        <button type="submit" disabled={cargando}>
          {esEdicion ? 'Actualizar' : 'Crear'}
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
  ), [personajeForm, mensajeError, cargando, esEdicion, vistaActual, manejarCambio, manejarSubmit]); // Dependencias relevantes para VistaNuevo

  return (
    <div className="personajes-container">
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
        {/* Renderizado condicional con componentes memorizados */}
        {vistaActual === 'listar' && VistaListar}
        {vistaActual === 'buscar' && VistaBuscar}
        {vistaActual === 'nuevo' && VistaNuevo}
      </main>
    </div>
  );
};

export default Personajes;