// src/components/Estudios.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Estudios.css'; // Opcional: archivo de estilos

const API_BASE_URL = 'http://localhost:3001/api';

const Estudios = () => {
  const [vistaActual, setVistaActual] = useState('listar'); // Solo listar y buscar
  const [estudios, setEstudios] = useState([]);
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaForm, setBusquedaForm] = useState({
    descripcion_grabacion: '' // Campo de ejemplo para búsqueda
    // Puedes añadir más campos aquí en el futuro (tipo, fecha, lugar, tipo_estudio, ordinal)
  });

  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // --- Componente Reutilizable TablaEstudios ---
  const TablaEstudios = useCallback(({ estudios, cargando, titulo = "Estudios" }) => {
    return (
      <div className="tabla-estudios">
        <h3>{titulo}</h3>
        {estudios.length === 0 ? (
          <p>No hay datos para mostrar.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID Grabación</th>
                <th>Descripción Grabación</th>
                <th>Tipo Grabación</th>
                <th>Fecha Grabación</th>
                <th>Lugar Grabación</th>
                <th>Tipo de Estudio</th>
                <th>Ordinal</th>
                {/* No hay botones de Editar/Borrar en esta vista */}
              </tr>
            </thead>
            <tbody>
              {estudios.map((estudio) => (
                <tr key={estudio.id_grabacion}>
                  <td>{estudio.id_grabacion}</td>
                  <td>{estudio.grabacion ? estudio.grabacion.descripcion : '-'}</td>
                  <td>{estudio.grabacion ? estudio.grabacion.tipo : '-'}</td>
                  <td>{estudio.grabacion ? estudio.grabacion.fecha : '-'}</td>
                  <td>{estudio.grabacion ? estudio.grabacion.lugar : '-'}</td>
                  <td>{estudio.tipo}</td>
                  <td>{estudio.ordinal !== null && estudio.ordinal !== undefined ? estudio.ordinal : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }, []);


  // --- Funciones ---

  const obtenerEstudios = useCallback(async () => {
    setCargando(true);
    setMensajeError('');
    try {
      const response = await fetch(`${API_BASE_URL}/estudios?sort=id_grabacion&order=ASC`); // O sort=grabacion.descripcion, etc.
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.status}`);
      }
      const data = await response.json();
      setEstudios(data);
    } catch (error) {
      console.error('Error al cargar estudios:', error);
      setMensajeError(`Error al cargar los estudios: ${error.message}`);
      setEstudios([]);
    } finally {
      setCargando(false);
    }
  }, []);

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
      let resultados = estudios;

      if (busquedaForm.descripcion_grabacion) {
        resultados = resultados.filter(estudio =>
          estudio.grabacion && estudio.grabacion.descripcion.toLowerCase().includes(busquedaForm.descripcion_grabacion.toLowerCase())
        );
      }
      // Puedes añadir más condiciones aquí para otros campos de búsqueda en el futuro
      // if (busquedaForm.tipo_estudio) { ... }
      // if (busquedaForm.fecha_grabacion) { ... }

      setResultadosBusqueda(resultados);
      setMensajeError('');
    } catch (error) {
      console.error('Error al filtrar estudios:', error);
      setMensajeError(`Error al filtrar los estudios: ${error.message}`);
      setResultadosBusqueda([]);
    } finally {
      setCargando(false);
    }
  }, [estudios, busquedaForm]);

  const limpiarBusqueda = useCallback(() => {
    setBusquedaForm({
      descripcion_grabacion: ''
      // Reinicia otros campos de búsqueda si los añades
    });
    setResultadosBusqueda([]);
    setMensajeError('');
  }, []);


  // --- Componentes de Vista Memorizados ---

  const VistaListar = useMemo(() => (
    <div className="vista-listar">
      <h3>Lista de Estudios</h3>
      {mensajeError && vistaActual === 'listar' && <div className="error-message">{mensajeError}</div>}
      {cargando && vistaActual === 'listar' && <div className="loading">Cargando...</div>}
      {!cargando && vistaActual === 'listar' && estudios.length === 0 ? (
        <p>No hay estudios registrados.</p>
      ) : vistaActual === 'listar' ? (
        <TablaEstudios
          estudios={estudios}
          cargando={cargando}
        />
      ) : null}
    </div>
  ), [estudios, mensajeError, cargando, vistaActual]);


  const VistaBuscar = useMemo(() => (
    <div className="vista-buscar">
      <h3>Formulario de Búsqueda</h3>
      <form onSubmit={(e) => { e.preventDefault(); ejecutarBusqueda(); }} className="busqueda-form">
        <label>
          Descripción de la Grabación:
          <input
            type="text"
            name="descripcion_grabacion"
            value={busquedaForm.descripcion_grabacion}
            onChange={manejarCambioBusqueda}
          />
        </label>
        {/* Puedes añadir más campos de búsqueda aquí */}
        <button type="submit" disabled={cargando}>Buscar</button>
        <button type="button" onClick={limpiarBusqueda} disabled={cargando}>Limpiar</button>
      </form>

      {mensajeError && vistaActual === 'buscar' && <div className="error-message">{mensajeError}</div>}
      {cargando && vistaActual === 'buscar' && <div className="loading">Buscando...</div>}

      {!cargando && vistaActual === 'buscar' && (
        <TablaEstudios
          estudios={resultadosBusqueda}
          cargando={cargando}
          titulo="Resultados de la Búsqueda"
        />
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && busquedaForm.descripcion_grabacion && (
        <p>No se encontraron estudios que coincidan con la búsqueda.</p>
      )}
      {!cargando && vistaActual === 'buscar' && resultadosBusqueda.length === 0 && !busquedaForm.descripcion_grabacion && (
        <p>Introduzca términos de búsqueda y pulse "Buscar".</p>
      )}
    </div>
  ), [busquedaForm, ejecutarBusqueda, limpiarBusqueda, manejarCambioBusqueda, mensajeError, cargando, vistaActual, resultadosBusqueda]);


  // --- Efecto ---
  useEffect(() => {
    if (vistaActual === 'listar') {
      obtenerEstudios();
    }
  }, [vistaActual, obtenerEstudios]);


  // --- Renderizado ---
  return (
    <div className="estudios-container">
      <h2>Gestión de Estudios</h2>

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
          {/* No hay opción de "Nuevo" para Estudios */}
        </ul>
      </nav>

      <main className="contenido-principal">
        {vistaActual === 'listar' && VistaListar}
        {vistaActual === 'buscar' && VistaBuscar}
        {/* No hay vista "nuevo" */}
      </main>
    </div>
  );
};

export default Estudios;