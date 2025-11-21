// src/components/Personajes.js
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Añade useMemo
import './Personajes.css';

const API_BASE_URL = 'http://localhost:3001/api';

const Personajes = () => {
  const [vistaActual, setVistaActual] = useState('listar');
  const [personajes, setPersonajes] = useState([]);
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

  const obtenerPersonajes = useCallback(async () => { // Memoriza esta función también
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
  }, []); // No depende de nada externo que cambie en renderizados

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

  // Memoriza manejarSubmit
  const manejarSubmit = useCallback(async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeError('');

    try {
      let response;
      if (esEdicion) {
        response = await fetch(`${API_BASE_URL}/personajes/${personajeForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(personajeForm),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/personajes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(personajeForm),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${esEdicion ? 'actualizar' : 'crear'} el personaje`);
      }

      const resultado = await response.json();
      console.log(`${esEdicion ? 'Actualizado' : 'Creado'} personaje:`, resultado);

      setPersonajeForm({
        id: '',
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
      // setVistaActual('listar');

    } catch (error) {
      console.error(`Error al ${esEdicion ? 'actualizar' : 'crear'} personaje:`, error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [esEdicion, personajeForm, vistaActual, obtenerPersonajes]); // Añade dependencias relevantes

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
      <h3>Lista de Personajes</h3>
      {mensajeError && vistaActual === 'listar' && <div className="error-message">{mensajeError}</div>}
      {cargando && vistaActual === 'listar' && <div className="loading">Cargando...</div>}
      {!cargando && vistaActual === 'listar' && personajes.length === 0 ? (
        <p>No hay personajes registrados.</p>
      ) : vistaActual === 'listar' ? (
        <table className="tabla-personajes">
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
                    onClick={() => cargarParaEditar(personaje)}
                    disabled={cargando}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarPersonaje(personaje.id)}
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
      ) : null}
    </div>
  ), [personajes, mensajeError, cargando, vistaActual, cargarParaEditar, eliminarPersonaje]); // Dependencias relevantes para VistaListar


  // VistaBuscar: Por ahora es simple, pero puedes memorizarla también si crece
  const VistaBuscar = useMemo(() => (
    <div className="vista-buscar">
      <h3>Formulario de Búsqueda</h3>
      <p>Implementa aquí los campos de búsqueda (por nombre, fechas, etc.).</p>
      {/* Temporalmente, mostrar la lista aquí también si es la vista actual */}
      {vistaActual === 'buscar' && (
        <table className="tabla-personajes">
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
                    onClick={() => cargarParaEditar(personaje)}
                    disabled={cargando}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarPersonaje(personaje.id)}
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
  ), [personajes, vistaActual, cargando, cargarParaEditar, eliminarPersonaje]); // Dependencias relevantes para VistaBuscar


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
              Listar
            </button>
          </li>
          <li>
            <button
              className={vistaActual === 'buscar' ? 'active' : ''}
              onClick={() => setVistaActual('buscar')}
            >
              Buscar
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
        {/* Renderizado condicional con componentes memorizados */}
        {vistaActual === 'listar' && VistaListar}
        {vistaActual === 'buscar' && VistaBuscar}
        {vistaActual === 'nuevo' && VistaNuevo}
      </main>
    </div>
  );
};

export default Personajes;