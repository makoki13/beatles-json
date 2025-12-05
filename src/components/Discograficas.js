// src/components/Discograficas.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Discograficas.css'; // Opcional: archivo de estilos

const API_BASE_URL = 'http://localhost:3001/api';

const Discograficas = () => {
  const [vistaActual, setVistaActual] = useState('listar');
  const [discograficas, setDiscograficas] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaForm, setBusquedaForm] = useState({
    nombre: '' // Campo de ejemplo para búsqueda
    // Puedes añadir más campos aquí en el futuro (descripcion, pais)
  });

  const [discograficaForm, setDiscograficaForm] = useState({
    id: '',
    nombre: '',
    descripcion: '',
    pais: ''
  });
  const [esEdicion, setEsEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // --- Componente Reutilizable TablaDiscograficas ---
  const TablaDiscograficas = useCallback(({ discograficas, onEditar, onEliminar, cargando, titulo = "Discográficas" }) => {
    return (
      <div className="tabla-discograficas">
        {discograficas.length === 0 ? (
          <p>There's no data to show.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Country</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discograficas.map((discografica) => (
                <tr key={discografica.id}>
                  <td>{discografica.nombre}</td>
                  <td>{discografica.descripcion || '-'}</td>
                  <td>{discografica.pais || '-'}</td>
                  <td>
                    <button
                      onClick={() => onEditar(discografica)}
                      disabled={cargando}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onEliminar(discografica.id)}
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

  const obtenerDiscograficas = useCallback(async () => {
    setCargando(true);
    setMensajeError('');
    try {
      // Mantenemos el orden alfabético por nombre al obtener todas
      const response = await fetch(`${API_BASE_URL}/discograficas?sort=nombre&order=ASC`);
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setDiscograficas(data);
    } catch (error) {
      console.error('Error al cargar discográficas:', error);
      setMensajeError(`Error al cargar las discográficas: ${error.message}`);
      setDiscograficas([]);
    } finally {
      setCargando(false);
    }
  }, []);

  const manejarCambio = useCallback((e) => {
    const { name, value } = e.target;
    setDiscograficaForm(prev => ({
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
      const datosAPostear = { ...discograficaForm };
      if (!esEdicion) {
        delete datosAPostear.id;
      }

      if (esEdicion) {
        response = await fetch(`${API_BASE_URL}/discograficas/${discograficaForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(discograficaForm), // Puedes enviar discograficaForm directamente
        });
      } else {
        response = await fetch(`${API_BASE_URL}/discograficas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosAPostear), // Enviar el objeto sin 'id'
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${esEdicion ? 'actualizar' : 'crear'} la discográfica`);
      }

      const resultado = await response.json();
      console.log(`${esEdicion ? 'Actualizada' : 'Creada'} discográfica:`, resultado);

      setDiscograficaForm({
        id: '',
        nombre: '',
        descripcion: '',
        pais: ''
      });
      setEsEdicion(false);

      if (vistaActual === 'listar' || vistaActual === 'nuevo') {
        await obtenerDiscograficas(); // Refresca la lista completa
      }

    } catch (error) {
      console.error(`Error al ${esEdicion ? 'actualizar' : 'crear'} discográfica:`, error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [esEdicion, discograficaForm, vistaActual, obtenerDiscograficas]);

  const cargarParaEditar = useCallback((discografica) => {
    setDiscograficaForm(discografica);
    setEsEdicion(true);
    setVistaActual('nuevo');
  }, []);

  const iniciarCreacion = useCallback(() => {
    setDiscograficaForm({
      id: '',
      nombre: '',
      descripcion: '',
      pais: ''
    });
    setEsEdicion(false);
    setMensajeError('');
    setVistaActual('nuevo');
  }, []);

  const eliminarDiscografica = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta discográfica?')) {
      return;
    }

    setCargando(true);
    setMensajeError('');

    try {
      const response = await fetch(`${API_BASE_URL}/discograficas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar la discográfica: ${response.status}`);
      }

      console.log('Discográfica eliminada con id:', id);

      if (vistaActual === 'listar') {
        await obtenerDiscograficas(); // Refresca la lista completa
      }

    } catch (error) {
      console.error('Error al eliminar discográfica:', error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [vistaActual, obtenerDiscograficas]);

  const ejecutarBusqueda = useCallback(() => {
    setCargando(true);
    setMensajeError('');

    try {
      let resultados = discograficas;

      if (busquedaForm.nombre) {
        resultados = resultados.filter(discografica =>
          discografica.nombre.toLowerCase().includes(busquedaForm.nombre.toLowerCase())
        );
      }
      // Puedes añadir más condiciones aquí para otros campos de búsqueda en el futuro
      // if (busquedaForm.pais) { ... }

      setResultadosBusqueda(resultados);
      setMensajeError('');
    } catch (error) {
      console.error('Error al filtrar discográficas:', error);
      setMensajeError(`Error al filtrar las discográficas: ${error.message}`);
      setResultadosBusqueda([]);
    } finally {
      setCargando(false);
    }
  }, [discograficas, busquedaForm]);

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
      {!cargando && vistaActual === 'listar' && discograficas.length === 0 ? (
        <p>There's no labels registered.</p>
      ) : vistaActual === 'listar' ? (
        <TablaDiscograficas
          discograficas={discograficas}
          onEditar={cargarParaEditar}
          onEliminar={eliminarDiscografica}
          cargando={cargando}
        />
      ) : null}
    </div>
  ), [discograficas, mensajeError, cargando, vistaActual, cargarParaEditar, eliminarDiscografica, TablaDiscograficas]);


  const VistaBuscar = useMemo(() => (
    <div className="vista-buscar">
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

      {!cargando && vistaActual === 'buscar' && (
        <TablaDiscograficas
          discograficas={resultadosBusqueda}
          onEditar={cargarParaEditar}
          onEliminar={eliminarDiscografica}
          cargando={cargando}
          titulo="Resultados de la Búsqueda"
        />
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && busquedaForm.nombre && (
        <p>There's no data found.</p>
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && !busquedaForm.nombre && (
        <p>Introduce string to look up and choose "Search".</p>
      )}
    </div>
  ), [busquedaForm, ejecutarBusqueda, limpiarBusqueda, manejarCambioBusqueda, mensajeError, cargando, vistaActual, resultadosBusqueda, cargarParaEditar, eliminarDiscografica, TablaDiscograficas]);


  const VistaNuevo = useMemo(() => (
    <div className="vista-nuevo">
      <h3>{esEdicion ? 'Edit Label' : 'New Label'}</h3>
      {mensajeError && vistaActual === 'nuevo' && <div className="error-message">{mensajeError}</div>}
      <form onSubmit={manejarSubmit} className="discografica-form">
        {esEdicion && <input type="hidden" name="id" value={discograficaForm.id} />}
        <label>
          Name:
          <input
            type="text"
            name="nombre"
            value={discograficaForm.nombre}
            onChange={manejarCambio}
            required
          />
        </label>
        <label>
          Description:
          <textarea
            name="descripcion"
            value={discograficaForm.descripcion}
            onChange={manejarCambio}
            rows="3" // Ajusta según necesites
          />
        </label>
        <label>
          Country:
          <input
            type="text"
            name="pais"
            value={discograficaForm.pais}
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
  ), [discograficaForm, mensajeError, cargando, esEdicion, vistaActual, manejarCambio, manejarSubmit]);


  // --- Efecto ---
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerDiscograficas();
    }
  }, [vistaActual, obtenerDiscograficas]); // Añade obtenerDiscograficas como dependencia


  // --- Renderizado ---
  return (
    <div className="discograficas-container">
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

export default Discograficas;