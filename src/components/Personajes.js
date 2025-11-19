// src/components/Personajes.js
import React, { useState, useEffect } from 'react';
import './Personajes.css'; // Asumiendo que actualizas los estilos también

const API_BASE_URL = 'http://localhost:3001/api'; // Ajusta el puerto si es necesario

const Personajes = () => {
  // Estado para manejar la vista activa (listar, buscar, nuevo)
  const [vistaActual, setVistaActual] = useState('listar'); // Vista por defecto
  // Estado para la lista de personajes
  const [personajes, setPersonajes] = useState([]);
  // Estado para el formulario
  const [personajeForm, setPersonajeForm] = useState({
    nombre: '',
    fecha_nacimiento: '',
    lugar_nacimiento: '',
    fecha_fallecimiento: '',
    lugar_fallecimiento: ''
  });
  // Estado para saber si estamos editando
  const [esEdicion, setEsEdicion] = useState(false);
  // Estado para manejar la carga
  const [cargando, setCargando] = useState(false);
  // Estado para mensajes de error
  const [mensajeError, setMensajeError] = useState('');

  // Función para cargar personajes desde la API
  const obtenerPersonajes = async () => {
    setCargando(true);
    setMensajeError(''); // Limpiar error previo
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
  };

  // Cargar personajes cuando la vista 'listar' esté activa o al montar si es la vista por defecto
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerPersonajes();
    }
  }, [vistaActual]); // Se ejecuta cuando cambia vistaActual

  // Función para manejar cambios en los inputs del formulario
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setPersonajeForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar el submit del formulario (crear o actualizar)
  const manejarSubmit = async (e) => {
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

      // Limpiar formulario y salir del modo edición
      setPersonajeForm({
        nombre: '',
        fecha_nacimiento: '',
        lugar_nacimiento: '',
        fecha_fallecimiento: '',
        lugar_fallecimiento: ''
      });
      setEsEdicion(false);

      // Si la vista actual es 'listar', refresca la lista
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
  };

  // Función para cargar un personaje en el formulario para editarlo (y cambiar a vista 'nuevo')
  const cargarParaEditar = (personaje) => {
    setPersonajeForm(personaje);
    setEsEdicion(true);
    setVistaActual('nuevo'); // Cambia a la vista de nuevo/editar
  };

  // Función para iniciar la creación de un nuevo personaje (y cambiar a vista 'nuevo')
  const iniciarCreacion = () => {
    setPersonajeForm({
      nombre: '',
      fecha_nacimiento: '',
      lugar_nacimiento: '',
      fecha_fallecimiento: '',
      lugar_fallecimiento: ''
    });
    setEsEdicion(false);
    setMensajeError('');
    setVistaActual('nuevo'); // Cambia a la vista de nuevo/editar
  };

  // Función para eliminar un personaje
  const eliminarPersonaje = async (id) => {
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

      // Si la vista actual es 'listar', refresca la lista
      if (vistaActual === 'listar') {
        await obtenerPersonajes();
      }

    } catch (error) {
      console.error('Error al eliminar personaje:', error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  };

  // --- Componentes de Vista ---
  const VistaListar = () => (
    <div className="vista-listar">      
      {mensajeError && <div className="error-message">{mensajeError}</div>}
      {cargando && <div className="loading">Cargando...</div>}
      {!cargando && personajes.length === 0 ? (
        <p>No hay personajes registrados.</p>
      ) : (
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
  );

  const VistaBuscar = () => (
    <div className="vista-buscar">
      <h3>Formulario de Búsqueda</h3>
      {/* Aquí irá el formulario de búsqueda específico */}
      <p>Implementa aquí los campos de búsqueda (por nombre, fechas, etc.).</p>
      {/* Por ahora, simplemente mostramos una tabla con los resultados de búsqueda */}
      {/* Puedes usar la misma lógica de VistaListar o una versión filtrada */}
      <VistaListar />
    </div>
  );

  const VistaNuevo = () => (
    <div className="vista-nuevo">
      <h3>{esEdicion ? 'Editar Personaje' : 'Nuevo Personaje'}</h3>
      {mensajeError && <div className="error-message">{mensajeError}</div>}
      <form onSubmit={manejarSubmit} className="personaje-form">
        <label>
          Nombre:
          <input
            type="text"
            name="nombre"
            value={personajeForm.nombre}
            onChange={manejarCambio}
            required
          />
        </label>
        <label>
          Fecha de Nacimiento:
          <input
            type="date"
            name="fecha_nacimiento"
            value={personajeForm.fecha_nacimiento}
            onChange={manejarCambio}
          />
        </label>
        <label>
          Lugar de Nacimiento:
          <input
            type="text"
            name="lugar_nacimiento"
            value={personajeForm.lugar_nacimiento}
            onChange={manejarCambio}
          />
        </label>
        <label>
          Fecha de Fallecimiento:
          <input
            type="date"
            name="fecha_fallecimiento"
            value={personajeForm.fecha_fallecimiento}
            onChange={manejarCambio}
          />
        </label>
        <label>
          Lugar de Fallecimiento:
          <input
            type="text"
            name="lugar_fallecimiento"
            value={personajeForm.lugar_fallecimiento}
            onChange={manejarCambio}
          />
        </label>
        <button type="submit" disabled={cargando}>
          {esEdicion ? 'Actualizar' : 'Crear'}
        </button>
        {/* Botón para cancelar edición y volver a la lista */}
        <button
          type="button"
          onClick={() => setVistaActual('listar')} // Vuelve a la vista de listar
          disabled={cargando}
        >
          Cancelar
        </button>
      </form>
    </div>
  );

  return (
    <div className="personajes-container">     

      {/* Menú Lateral Izquierdo */}
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
              onClick={iniciarCreacion} // Esta función cambia la vista a 'nuevo'
            >
              Nuevo
            </button>
          </li>
        </ul>
      </nav>

      {/* Contenido Principal basado en la vista actual */}
      <main className="contenido-principal">
        {vistaActual === 'listar' && <VistaListar />}
        {vistaActual === 'buscar' && <VistaBuscar />}
        {vistaActual === 'nuevo' && <VistaNuevo />}
      </main>
    </div>
  );
};

export default Personajes;