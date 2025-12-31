import 'package:flutter/material.dart';
import 'package:beatles_json/components/personajes_table.dart';
import 'package:beatles_json/models/personaje.dart';
import 'package:beatles_json/repositories/personajes_repository.dart';
import 'package:beatles_json/pages/personajes/personajes_add.dart';

class PersonajesBuscarPage extends StatefulWidget {
  @override
  _PersonajesBuscarPageState createState() => _PersonajesBuscarPageState();
}

class _PersonajesBuscarPageState extends State<PersonajesBuscarPage> {
  final TextEditingController _nombreController = TextEditingController();
  final TextEditingController _lugarNacimientoController = TextEditingController();
  final TextEditingController _lugarFallecimientoController = TextEditingController();
  DateTime? _fechaNacimiento;
  DateTime? _fechaFallecimiento;
  bool _estaVivo = false;

  List<Personaje> _resultadosBusqueda = [];
  bool _isLoading = false;
  String? _errorMessage;
  bool _mostrarResultados = false;
  Personaje? _selectedPersonaje; // Personaje seleccionado para editar/eliminar

  @override
  void dispose() {
    _nombreController.dispose();
    _lugarNacimientoController.dispose();
    _lugarFallecimientoController.dispose();
    super.dispose();
  }

  Future<void> _editarPersonaje(Personaje personaje) async {
    // Navegar a la página de edición con los datos del personaje
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => PersonajesAddPage(
          personaje: personaje, // Pasar el personaje para edición
        ),
      ),
    );

    // Si se actualizó el personaje, recargar la búsqueda
    if (result == true) {
      _realizarBusqueda();
    }
  }

  Future<void> _eliminarPersonaje(Personaje personaje) async {
    bool confirmado = await _mostrarDialogoConfirmacion(context, personaje.nombre);
    if (confirmado) {
      try {
        bool success = await PersonajesRepository.deletePersonaje(personaje.id);
        if (success) {
          if (mounted) {
            setState(() {
              _resultadosBusqueda.removeWhere((p) => p.id == personaje.id);
              _selectedPersonaje = null; // Limpiar selección
            });
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Personaje "${personaje.nombre}" eliminado correctamente'),
                backgroundColor: Colors.green,
              ),
            );
          }
        } else {
          throw Exception('No se pudo eliminar el personaje');
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error al eliminar el personaje: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<bool> _mostrarDialogoConfirmacion(BuildContext context, String nombre) async {
    return await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Confirmar eliminación'),
          content: Text('¿Estás seguro de que deseas eliminar a "$nombre"?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: Text('Cancelar'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: Text('Eliminar'),
              style: TextButton.styleFrom(foregroundColor: Colors.red),
            ),
          ],
        );
      },
    ) ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Buscar Personajes'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
        actions: [
          // Botón para editar el personaje seleccionado
          IconButton(
            icon: Icon(Icons.edit, color: Colors.white),
            onPressed: _selectedPersonaje != null 
              ? () => _editarPersonaje(_selectedPersonaje!)
              : null,
            tooltip: 'Editar personaje seleccionado',
          ),
          // Botón para eliminar el personaje seleccionado
          IconButton(
            icon: Icon(Icons.delete, color: Colors.white),
            onPressed: _selectedPersonaje != null 
              ? () async {
                  bool confirmado = await _mostrarDialogoConfirmacion(context, _selectedPersonaje!.nombre);
                  if (confirmado) {
                    _eliminarPersonaje(_selectedPersonaje!);
                  }
                }
              : null,
            tooltip: 'Eliminar personaje seleccionado',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Campo de búsqueda por nombre
              TextFormField(
                controller: _nombreController,
                decoration: InputDecoration(
                  labelText: 'Nombre',
                  hintText: 'Ingrese nombre del personaje',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  prefixIcon: Icon(Icons.person),
                ),
              ),
              SizedBox(height: 16),

              // Campo de búsqueda por lugar de nacimiento
              TextFormField(
                controller: _lugarNacimientoController,
                decoration: InputDecoration(
                  labelText: 'Lugar de Nacimiento',
                  hintText: 'Ingrese lugar de nacimiento',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  prefixIcon: Icon(Icons.location_on),
                ),
              ),
              SizedBox(height: 16),

              // Campo de búsqueda por lugar de fallecimiento
              TextFormField(
                controller: _lugarFallecimientoController,
                decoration: InputDecoration(
                  labelText: 'Lugar de Fallecimiento',
                  hintText: 'Ingrese lugar de fallecimiento',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  prefixIcon: Icon(Icons.place),
                ),
              ),
              SizedBox(height: 16),

              // Selector de fecha de nacimiento
              Text(
                'Fecha de Nacimiento',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              SizedBox(height: 8),
              TextButton.icon(
                onPressed: () => _selectDate(context, 'nacimiento'),
                icon: Icon(Icons.date_range),
                label: Text(
                  _fechaNacimiento != null
                      ? 'Fecha: ${_formatDate(_fechaNacimiento!)}'
                      : 'Seleccionar Fecha de Nacimiento',
                ),
              ),
              SizedBox(height: 16),

              // Selector de fecha de fallecimiento
              Text(
                'Fecha de Fallecimiento',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              SizedBox(height: 8),
              TextButton.icon(
                onPressed: () => _selectDate(context, 'fallecimiento'),
                icon: Icon(Icons.date_range),
                label: Text(
                  _fechaFallecimiento != null
                      ? 'Fecha: ${_formatDate(_fechaFallecimiento!)}'
                      : 'Seleccionar Fecha de Fallecimiento',
                ),
              ),
              SizedBox(height: 16),

              // Selector para personajes vivos
              SwitchListTile(
                title: Text('Mostrar solo personajes vivos'),
                value: _estaVivo,
                onChanged: (bool value) {
                  setState(() {
                    _estaVivo = value;
                  });
                },
              ),
              SizedBox(height: 24),

              // Botón de búsqueda
              ElevatedButton(
                onPressed: _realizarBusqueda,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[600],
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.search),
                    SizedBox(width: 8),
                    Text(
                      'Buscar Personajes',
                      style: TextStyle(fontSize: 16),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 16),

              // Botón para limpiar filtros
              OutlinedButton(
                onPressed: _limpiarFiltros,
                style: OutlinedButton.styleFrom(
                  padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.clear),
                    SizedBox(width: 8),
                    Text(
                      'Limpiar Filtros',
                      style: TextStyle(fontSize: 16),
                    ),
                  ],
                ),
              ),

              // Mostrar resultados de búsqueda si están disponibles
              if (_mostrarResultados)
                Padding(
                  padding: const EdgeInsets.only(top: 24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Resultados de la búsqueda',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      PersonajesTable(
                        personajes: _resultadosBusqueda,
                        isLoading: _isLoading,
                        errorMessage: _errorMessage,
                        onPersonajeSelected: (personaje) {
                          setState(() {
                            _selectedPersonaje = personaje;
                          });
                        },
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _selectDate(BuildContext context, String tipo) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );

    if (picked != null) {
      setState(() {
        switch (tipo) {
          case 'nacimiento':
            _fechaNacimiento = picked;
            break;
          case 'fallecimiento':
            _fechaFallecimiento = picked;
            break;
        }
      });
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _realizarBusqueda() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _mostrarResultados = true;
      _selectedPersonaje = null; // Limpiar selección al realizar nueva búsqueda
    });

    try {
      final resultados = await PersonajesRepository.searchPersonajes(
        nombre: _nombreController.text.trim().isNotEmpty ? _nombreController.text.trim() : null,
        lugarNacimiento: _lugarNacimientoController.text.trim().isNotEmpty ? _lugarNacimientoController.text.trim() : null,
        lugarFallecimiento: _lugarFallecimientoController.text.trim().isNotEmpty ? _lugarFallecimientoController.text.trim() : null,
        fechaNacimiento: _fechaNacimiento,
        fechaFallecimiento: _fechaFallecimiento,
        estaVivo: _estaVivo,
      );

      if (mounted) {
        setState(() {
          _resultadosBusqueda = resultados;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Error al buscar personajes: $e';
          _isLoading = false;
        });
      }
    }
  }

  void _limpiarFiltros() {
    setState(() {
      _nombreController.clear();
      _lugarNacimientoController.clear();
      _lugarFallecimientoController.clear();
      _fechaNacimiento = null;
      _fechaFallecimiento = null;
      _estaVivo = false;
      _selectedPersonaje = null; // Limpiar selección al limpiar filtros
    });
  }
}