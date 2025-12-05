// src/components/Publicaciones.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Publicaciones.css'; // Opcional: archivo de estilos

const API_BASE_URL = 'http://localhost:3001/api';

const Publicaciones = () => {
  const [vistaActual, setVistaActual] = useState('listar');
  const [publicaciones, setPublicaciones] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaForm, setBusquedaForm] = useState({
    formato: '' // Campo de ejemplo para búsqueda
    // Puedes añadir más campos aquí en el futuro (pais, fecha, label, codigo_planta_prensado, oficial)
  });

  const [publicacionForm, setPublicacionForm] = useState({
    id: '',
    master_id: '', // ID del master seleccionado
    discografica_id: '', // ID de la discográfica seleccionada (puede ser null)
    oficial: false,
    formato: '',
    pais: '',
    fecha: '', // Formato YYYY-MM-DD
    label: '',
    codigo_planta_prensado: ''
  });

  // Estados para almacenar listas de masters y discograficas
  const [masters, setMasters] = useState([]);
  const [discograficas, setDiscograficas] = useState([]);

  const [esEdicion, setEsEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // --- Componente Reutilizable TablaPublicaciones ---
  const TablaPublicaciones = useCallback(({ publicaciones, onEditar, onEliminar, cargando, titulo = "Publicaciones" }) => {
    return (
      <div className="tabla-publicaciones">
        {publicaciones.length === 0 ? (
          <p>There's no data to show.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Master</th>
                <th>Label</th>
                <th>Is Official?</th>
                <th>Format</th>
                <th>Country</th>
                <th>Date</th>
                <th>Label</th>
                <th>Press Plant Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {publicaciones.map((publicacion) => (
                <tr key={publicacion.id}>
                  <td>{publicacion.master ? publicacion.master.id : '-'}</td> {/* Muestra ID o nombre si se incluye */}
                  <td>{publicacion.discografica ? publicacion.discografica.nombre : '-'}</td>
                  <td>{publicacion.oficial ? 'Sí' : 'No'}</td>
                  <td>{publicacion.formato || '-'}</td>
                  <td>{publicacion.pais || '-'}</td>
                  <td>{publicacion.fecha || '-'}</td>
                  <td>{publicacion.label || '-'}</td>
                  <td>{publicacion.codigo_planta_prensado || '-'}</td>
                  <td>
                    <button
                      onClick={() => onEditar(publicacion)}
                      disabled={cargando}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onEliminar(publicacion.id)}
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

  const obtenerPublicaciones = useCallback(async () => {
    setCargando(true);
    setMensajeError('');
    try {
      // Mantenemos el orden por ID al obtener todas (puedes cambiarlo si lo deseas)
      const response = await fetch(`${API_BASE_URL}/publicaciones?sort=id&order=ASC`); // O sort=fecha, etc.
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setPublicaciones(data);
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
      setMensajeError(`Error al cargar las publicaciones: ${error.message}`);
      setPublicaciones([]);
    } finally {
      setCargando(false);
    }
  }, []);

  // Cargar masters y discograficas para los desplegables
  const obtenerMasters = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/masters?sort=id&order=ASC`); // O sort=obra.titulo, etc.
      if (!response.ok) {
        throw new Error(`Error al obtener masters: ${response.status}`);
      }
      const data = await response.json();
      setMasters(data);
    } catch (error) {
      console.error('Error al cargar masters para el desplegable:', error);
      // Opcional: Mostrar mensaje de error o dejar la lista vacía
    }
  }, []);

  const obtenerDiscograficas = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/discograficas?sort=nombre&order=ASC`);
      if (!response.ok) {
        throw new Error(`Error al obtener discográficas: ${response.status}`);
      }
      const data = await response.json();
      setDiscograficas(data);
    } catch (error) {
      console.error('Error al cargar discográficas para el desplegable:', error);
      // Opcional: Mostrar mensaje de error o dejar la lista vacía
    }
  }, []);

  // Cargar masters y discograficas cuando el componente se monta
  useEffect(() => {
    obtenerMasters();
    obtenerDiscograficas();
  }, [obtenerMasters, obtenerDiscograficas]);

  const manejarCambio = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setPublicacionForm(prev => ({
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
      const datosAPostear = { ...publicacionForm };
      if (!esEdicion) {
        delete datosAPostear.id;
      }

      if (esEdicion) {
        response = await fetch(`${API_BASE_URL}/publicaciones/${publicacionForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(publicacionForm), // Puedes enviar publicacionForm directamente
        });
      } else {
        response = await fetch(`${API_BASE_URL}/publicaciones`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosAPostear), // Enviar el objeto sin 'id'
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${esEdicion ? 'actualizar' : 'crear'} la publicación`);
      }

      const resultado = await response.json();
      console.log(`${esEdicion ? 'Actualizada' : 'Creada'} publicación:`, resultado);

      setPublicacionForm({
        id: '',
        master_id: '',
        discografica_id: '',
        oficial: false,
        formato: '',
        pais: '',
        fecha: '',
        label: '',
        codigo_planta_prensado: ''
      });
      setEsEdicion(false);

      if (vistaActual === 'listar' || vistaActual === 'nuevo') {
        await obtenerPublicaciones(); // Refresca la lista completa
      }

    } catch (error) {
      console.error(`Error al ${esEdicion ? 'actualizar' : 'crear'} publicación:`, error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [esEdicion, publicacionForm, vistaActual, obtenerPublicaciones]);

  const cargarParaEditar = useCallback((publicacion) => {
    // Cargar datos generales
    setPublicacionForm({
      ...publicacion,
      master_id: publicacion.master ? publicacion.master.id : '', // Extraer ID
      discografica_id: publicacion.discografica ? publicacion.discografica.id : '' // Extraer ID
    });
    setEsEdicion(true);
    setVistaActual('nuevo');
  }, []);

  const iniciarCreacion = useCallback(() => {
    setPublicacionForm({
      id: '',
      master_id: '',
      discografica_id: '',
      oficial: false,
      formato: '',
      pais: '',
      fecha: '',
      label: '',
      codigo_planta_prensado: ''
    });
    setEsEdicion(false);
    setMensajeError('');
    setVistaActual('nuevo');
  }, []);

  const eliminarPublicacion = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      return;
    }

    setCargando(true);
    setMensajeError('');

    try {
      const response = await fetch(`${API_BASE_URL}/publicaciones/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar la publicación: ${response.status}`);
      }

      console.log('Publicación eliminada con id:', id);

      if (vistaActual === 'listar') {
        await obtenerPublicaciones(); // Refresca la lista completa
      }

    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [vistaActual, obtenerPublicaciones]);

  const ejecutarBusqueda = useCallback(() => {
    setCargando(true);
    setMensajeError('');

    try {
      let resultados = publicaciones;

      if (busquedaForm.formato) {
        resultados = resultados.filter(publicacion =>
          publicacion.formato.toLowerCase().includes(busquedaForm.formato.toLowerCase())
        );
      }
      // Puedes añadir más condiciones aquí para otros campos de búsqueda en el futuro
      // if (typeof busquedaForm.oficial === 'boolean') { ... }
      // if (busquedaForm.fecha) { ... }
      // if (busquedaForm.pais) { ... }

      setResultadosBusqueda(resultados);
      setMensajeError('');
    } catch (error) {
      console.error('Error al filtrar publicaciones:', error);
      setMensajeError(`Error al filtrar las publicaciones: ${error.message}`);
      setResultadosBusqueda([]);
    } finally {
      setCargando(false);
    }
  }, [publicaciones, busquedaForm]);

  const limpiarBusqueda = useCallback(() => {
    setBusquedaForm({
      formato: ''
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
      {!cargando && vistaActual === 'listar' && publicaciones.length === 0 ? (
        <p>No hay publicaciones registradas.</p>
      ) : vistaActual === 'listar' ? (
        <TablaPublicaciones
          publicaciones={publicaciones}
          onEditar={cargarParaEditar}
          onEliminar={eliminarPublicacion}
          cargando={cargando}
        />
      ) : null}
    </div>
  ), [publicaciones, mensajeError, cargando, vistaActual, cargarParaEditar, eliminarPublicacion]);


  const VistaBuscar = useMemo(() => (
    <div className="vista-buscar">
      <form onSubmit={(e) => { e.preventDefault(); ejecutarBusqueda(); }} className="busqueda-form">
        <label>
          Format:
          <input
            type="text"
            name="formato"
            value={busquedaForm.formato}
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
        <TablaPublicaciones
          publicaciones={resultadosBusqueda}
          onEditar={cargarParaEditar}
          onEliminar={eliminarPublicacion}
          cargando={cargando}
          titulo="Resultados de la Búsqueda"
        />
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && busquedaForm.formato && (
        <p>No records to show.</p>
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && !busquedaForm.formato && (
        <p>Fill the form and press "Search".</p>
      )}
    </div>
  ), [busquedaForm, ejecutarBusqueda, limpiarBusqueda, manejarCambioBusqueda, mensajeError, cargando, vistaActual, resultadosBusqueda, cargarParaEditar, eliminarPublicacion]);


  const VistaNuevo = useMemo(() => (
    <div className="vista-nuevo">
      <h3>{esEdicion ? 'Edit Publish' : 'New Publish'}</h3>
      {mensajeError && vistaActual === 'nuevo' && <div className="error-message">{mensajeError}</div>}
      <form onSubmit={manejarSubmit} className="publicacion-form">
        {esEdicion && <input type="hidden" name="id" value={publicacionForm.id} />}
        <label>
          Master (required):
          <select
            name="master_id"
            value={publicacionForm.master_id}
            onChange={manejarCambio}
            required
          >
            <option value="">-- Select a master --</option>
            {masters.map(master => (
              <option key={master.id} value={master.id}>ID {master.id} ({master.obra?.titulo || 'Sin Obra'})</option>
            ))}
          </select>
        </label>
        <label>
          Label (opcional):
          <select
            name="discografica_id"
            value={publicacionForm.discografica_id}
            onChange={manejarCambio}
          >
            <option value="">-- Select a publisher --</option>
            {discograficas.map(discografica => (
              <option key={discografica.id} value={discografica.id}>{discografica.nombre}</option>
            ))}
          </select>
        </label>
        <label>
          Is Official?:
          <input
            type="checkbox"
            name="oficial"
            checked={publicacionForm.oficial}
            onChange={manejarCambio} // Usa la función general, maneja checkbox
          />
        </label>
        <label>
          Format:
          <input
            type="text"
            name="formato"
            value={publicacionForm.formato}
            onChange={manejarCambio}
          />
        </label>
        <label>
          Country:
          <input
            type="text"
            name="pais"
            value={publicacionForm.pais}
            onChange={manejarCambio}
          />
        </label>
        <label>
          Date:
          <input
            type="date"
            name="fecha"
            value={publicacionForm.fecha}
            onChange={manejarCambio}
          />
        </label>
        <label>
          Label:
          <input
            type="text"
            name="label"
            value={publicacionForm.label}
            onChange={manejarCambio}
          />
        </label>
        <label>
          Plant Pressing Code:
          <input
            type="text"
            name="codigo_planta_prensado"
            value={publicacionForm.codigo_planta_prensado}
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
  ), [publicacionForm, mensajeError, cargando, esEdicion, vistaActual, manejarCambio, manejarSubmit, masters, discograficas]); // Añadir masters y discograficas como dependencias


  // --- Efecto ---
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerPublicaciones();
    }
  }, [vistaActual, obtenerPublicaciones]);


  // --- Renderizado ---
  return (
    <div className="publicaciones-container">
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

export default Publicaciones;