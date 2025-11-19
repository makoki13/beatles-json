// src/components/Personajes.js
import React, { useState, useEffect } from 'react';
import './Personajes.css'; // Opcional: archivo de estilos

// URL base de la API
const API_BASE_URL = 'http://localhost:3001/api'; // Ajusta el puerto si es necesario

const Personajes = () => {
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
    try {
      const response = await fetch(`${API_BASE_URL}/personajes`);
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setPersonajes(data);
      setMensajeError(''); // Limpiar error si la carga es exitosa
    } catch (error) {
      console.error('Error al cargar personajes:', error);
      setMensajeError(`Error al cargar los personajes: ${error.message}`);
      setPersonajes([]); // Limpiar lista en caso de error
    } finally {
      setCargando(false);
    }
  };

  // Cargar personajes cuando el componente se monta
  useEffect(() => {
    obtenerPersonajes();
  }, []); // El array vacío [] significa que solo se ejecuta una vez al montar

  // Función para manejar cambios en los inputs del formulario
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setPersonajeForm(prev => ({
      ...prev,
      [name]: value // Actualiza el campo correspondiente
    }));
  };

  // Función para enviar el formulario (crear o actualizar)
  const manejarSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeError(''); // Limpiar error previo

    try {
      let response;
      if (esEdicion) {
        // Actualizar un personaje existente
        response = await fetch(`${API_BASE_URL}/personajes/${personajeForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(personajeForm),
        });
      } else {
        // Crear un nuevo personaje
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

      // Refrescar la lista de personajes
      await obtenerPersonajes();

      // Limpiar el formulario y salir del modo edición
      setPersonajeForm({
        nombre: '',
        fecha_nacimiento: '',
        lugar_nacimiento: '',
        fecha_fallecimiento: '',
        lugar_fallecimiento: ''
      });
      setEsEdicion(false);

    } catch (error) {
      console.error(`Error al ${esEdicion ? 'actualizar' : 'crear'} personaje:`, error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  };

  // Función para cargar un personaje en el formulario para editarlo
  const cargarParaEditar = (personaje) => {
    setPersonajeForm(personaje);
    setEsEdicion(true);
  };

  // Función para iniciar la creación de un nuevo personaje
  const iniciarCreacion = () => {
    setPersonajeForm({
      nombre: '',
      fecha_nacimiento: '',
      lugar_nacimiento: '',
      fecha_fallecimiento: '',
      lugar_fallecimiento: ''
    });
    setEsEdicion(false);
    setMensajeError(''); // Limpiar error al iniciar creación
  };

  // Función para eliminar un personaje
  const eliminarPersonaje = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este personaje?')) {
      return; // Si el usuario cancela, no hace nada
    }

    setCargando(true);
    setMensajeError(''); // Limpiar error previo

    try {
      const response = await fetch(`${API_BASE_URL}/personajes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar el personaje: ${response.status}`);
      }

      console.log('Personaje eliminado con id:', id);

      // Refrescar la lista de personajes
      await obtenerPersonajes();

    } catch (error) {
      console.error('Error al eliminar personaje:', error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="personajes-container">
      <h2>Gestión de Personajes</h2>

      {/* Mensaje de error */}
      {mensajeError && <div className="error-message">{mensajeError}</div>}
      {cargando && <div className="loading">Cargando...</div>}

      {/* Formulario de Crear/Editar */}
      <form onSubmit={manejarSubmit} className="personaje-form">
        <h3>{esEdicion ? 'Editar Personaje' : 'Nuevo Personaje'}</h3>
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
        {/* Botón para cancelar edición y limpiar el formulario */}
        {esEdicion && (
          <button type="button" onClick={iniciarCreacion} disabled={cargando}>
            Cancelar Edición
          </button>
        )}
      </form>

      {/* Botón para nuevo personaje */}
      <button onClick={iniciarCreacion} disabled={cargando} className="nuevo-btn">
        Nuevo Personaje
      </button>

      {/* Tabla de Personajes */}
      <div className="tabla-personajes">
        <h3>Lista de Personajes</h3>
        {personajes.length === 0 ? (
          <p>No hay personajes registrados.</p>
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
    </div>
  );
};

export default Personajes;