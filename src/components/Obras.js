// src/components/Obras.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Obras.css'; // Opcional: archivo de estilos

const API_BASE_URL = 'http://localhost:3001/api';

const Obras = () => {
  const [vistaActual, setVistaActual] = useState('listar');
  const [obras, setObras] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaForm, setBusquedaForm] = useState({
    titulo: '' // Campo de ejemplo para búsqueda
    // Puedes añadir más campos aquí en el futuro (oficial)
  });

  const [obraForm, setObraForm] = useState({
    id: '',
    titulo: '',
    oficial: false
  });
  const [esEdicion, setEsEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // --- Componente Reutilizable TablaObras ---
  const TablaObras = useCallback(({ obras, onEditar, onEliminar, cargando, titulo = "Obras" }) => {
    return (
      <div className="tabla-obras">        
        {obras.length === 0 ? (
          <p>There's no data to show.</p>
        ) : (
          <table>
            <thead>
              <tr>                
                <th>Title</th>
                <th>¿Is Official?</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {obras.map((obra) => (
                <tr key={obra.id}>                  
                  <td>{obra.titulo}</td>
                  <td>{obra.oficial ? 'Sí' : 'No'}</td>
                  <td>
                    <button
                      onClick={() => onEditar(obra)}
                      disabled={cargando}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onEliminar(obra.id)}
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

  const obtenerObras = useCallback(async () => {
    setCargando(true);
    setMensajeError('');
    try {
      // Mantenemos el orden alfabético por título al obtener todas
      const response = await fetch(`${API_BASE_URL}/obras?sort=titulo&order=ASC`);
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setObras(data);
    } catch (error) {
      console.error('Error al cargar obras:', error);
      setMensajeError(`Error al cargar las obras: ${error.message}`);
      setObras([]);
    } finally {
      setCargando(false);
    }
  }, []);

  const manejarCambio = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setObraForm(prev => ({
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
      const datosAPostear = { ...obraForm };
      if (!esEdicion) {
        delete datosAPostear.id;
      }

      if (esEdicion) {
        response = await fetch(`${API_BASE_URL}/obras/${obraForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(obraForm), // Puedes enviar obraForm directamente
        });
      } else {
        response = await fetch(`${API_BASE_URL}/obras`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosAPostear), // Enviar el objeto sin 'id'
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${esEdicion ? 'actualizar' : 'crear'} la obra`);
      }

      const resultado = await response.json();
      console.log(`${esEdicion ? 'Actualizada' : 'Creada'} obra:`, resultado);

      setObraForm({
        id: '',
        titulo: '',
        oficial: false
      });
      setEsEdicion(false);

      if (vistaActual === 'listar' || vistaActual === 'nuevo') {
        await obtenerObras(); // Refresca la lista completa
      }

    } catch (error) {
      console.error(`Error al ${esEdicion ? 'actualizar' : 'crear'} obra:`, error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [esEdicion, obraForm, vistaActual, obtenerObras]);

  const cargarParaEditar = useCallback((obra) => {
    setObraForm(obra);
    setEsEdicion(true);
    setVistaActual('nuevo');
  }, []);

  const iniciarCreacion = useCallback(() => {
    setObraForm({
      id: '',
      titulo: '',
      oficial: false
    });
    setEsEdicion(false);
    setMensajeError('');
    setVistaActual('nuevo');
  }, []);

  const eliminarObra = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta obra?')) {
      return;
    }

    setCargando(true);
    setMensajeError('');

    try {
      const response = await fetch(`${API_BASE_URL}/obras/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar la obra: ${response.status}`);
      }

      console.log('Obra eliminada con id:', id);

      if (vistaActual === 'listar') {
        await obtenerObras(); // Refresca la lista completa
      }

    } catch (error) {
      console.error('Error al eliminar obra:', error);
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  }, [vistaActual, obtenerObras]);

  const ejecutarBusqueda = useCallback(() => {
    setCargando(true);
    setMensajeError('');

    try {
      let resultados = obras;

      if (busquedaForm.titulo) {
        resultados = resultados.filter(obra =>
          obra.titulo.toLowerCase().includes(busquedaForm.titulo.toLowerCase())
        );
      }
      // Puedes añadir más condiciones aquí para otros campos de búsqueda en el futuro
      // if (typeof busquedaForm.oficial === 'boolean') { ... }

      setResultadosBusqueda(resultados);
      setMensajeError('');
    } catch (error) {
      console.error('Error al filtrar obras:', error);
      setMensajeError(`Error al filtrar las obras: ${error.message}`);
      setResultadosBusqueda([]);
    } finally {
      setCargando(false);
    }
  }, [obras, busquedaForm]);

  const limpiarBusqueda = useCallback(() => {
    setBusquedaForm({
      titulo: ''
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
      {!cargando && vistaActual === 'listar' && obras.length === 0 ? (
        <p>There's no works registered.</p>
      ) : vistaActual === 'listar' ? (
        <TablaObras
          obras={obras}
          onEditar={cargarParaEditar}
          onEliminar={eliminarObra}
          cargando={cargando}
        />
      ) : null}
    </div>
  ), [obras, mensajeError, cargando, vistaActual, cargarParaEditar, eliminarObra]);


  const VistaBuscar = useMemo(() => (
    <div className="vista-buscar">      
      <form onSubmit={(e) => { e.preventDefault(); ejecutarBusqueda(); }} className="busqueda-form">
        <label>
          Title:
          <input
            type="text"
            name="titulo"
            value={busquedaForm.titulo}
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
        <TablaObras
          obras={resultadosBusqueda}
          onEditar={cargarParaEditar}
          onEliminar={eliminarObra}
          cargando={cargando}
          titulo="Resultados de la Búsqueda"
        />
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && busquedaForm.titulo && (
        <p>No se encontraron obras que coincidan con la búsqueda.</p>
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && !busquedaForm.titulo && (
        <p>Introduce string to look up and choose "Search".</p>
      )}
    </div>
  ), [busquedaForm, ejecutarBusqueda, limpiarBusqueda, manejarCambioBusqueda, mensajeError, cargando, vistaActual, resultadosBusqueda, cargarParaEditar, eliminarObra]);


  const VistaNuevo = useMemo(() => (
    <div className="vista-nuevo">
      <h3>{esEdicion ? 'Edit' : 'New'}</h3>
      {mensajeError && vistaActual === 'nuevo' && <div className="error-message">{mensajeError}</div>}
      <form onSubmit={manejarSubmit} className="obra-form">
        {esEdicion && <input type="hidden" name="id" value={obraForm.id} />}
        <label>
          Title:
          <input
            type="text"
            name="titulo"
            value={obraForm.titulo}
            onChange={manejarCambio}
            required
          />
        </label>
        <label>
          ¿Is Official?:
          <input
            type="checkbox"
            name="oficial"
            checked={obraForm.oficial}
            onChange={manejarCambio} // Usa la función general, maneja checkbox
          />
        </label>
        <button type="submit" disabled={cargando}>
          {esEdicion ? 'Update' : 'Insert'}
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
  ), [obraForm, mensajeError, cargando, esEdicion, vistaActual, manejarCambio, manejarSubmit]);


  // --- Efecto ---
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerObras();
    }
  }, [vistaActual, obtenerObras]); // Añade obtenerObras como dependencia


  // --- Renderizado ---
  return (
    <div className="obras-container">      
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

export default Obras;