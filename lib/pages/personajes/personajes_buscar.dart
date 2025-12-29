import 'package:flutter/material.dart';
import 'package:beatles_json/components/personajes_table.dart';
import 'package:beatles_json/models/personaje.dart';
import 'package:beatles_json/repositories/personajes_repository.dart';

class PersonajesBuscarPage extends StatefulWidget {
  @override
  _PersonajesBuscarPageState createState() => _PersonajesBuscarPageState();
}

class _PersonajesBuscarPageState extends State<PersonajesBuscarPage> {
  final TextEditingController _nombreController = TextEditingController();
  final TextEditingController _lugarNacimientoController = TextEditingController();
  final TextEditingController _lugarFallecimientoController = TextEditingController();
  DateTime? _fechaNacimientoDesde;
  DateTime? _fechaNacimientoHasta;
  DateTime? _fechaFallecimientoDesde;
  DateTime? _fechaFallecimientoHasta;
  bool _estaVivo = false;

  List<Personaje> _resultadosBusqueda = [];
  bool _isLoading = false;
  String? _errorMessage;
  bool _mostrarResultados = false;

  @override
  void dispose() {
    _nombreController.dispose();
    _lugarNacimientoController.dispose();
    _lugarFallecimientoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Buscar Personajes'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
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

              // Selector de rango de fechas de nacimiento
              Text(
                'Rango de Fechas de Nacimiento',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextButton.icon(
                      onPressed: () => _selectDate(context, 'desde_nacimiento'),
                      icon: Icon(Icons.date_range),
                      label: Text(
                        _fechaNacimientoDesde != null
                            ? 'Desde: ${_formatDate(_fechaNacimientoDesde!)}'
                            : 'Fecha Desde',
                      ),
                    ),
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    child: TextButton.icon(
                      onPressed: () => _selectDate(context, 'hasta_nacimiento'),
                      icon: Icon(Icons.date_range),
                      label: Text(
                        _fechaNacimientoHasta != null
                            ? 'Hasta: ${_formatDate(_fechaNacimientoHasta!)}'
                            : 'Fecha Hasta',
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 16),

              // Selector de rango de fechas de fallecimiento
              Text(
                'Rango de Fechas de Fallecimiento',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextButton.icon(
                      onPressed: () => _selectDate(context, 'desde_fallecimiento'),
                      icon: Icon(Icons.date_range),
                      label: Text(
                        _fechaFallecimientoDesde != null
                            ? 'Desde: ${_formatDate(_fechaFallecimientoDesde!)}'
                            : 'Fecha Desde',
                      ),
                    ),
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    child: TextButton.icon(
                      onPressed: () => _selectDate(context, 'hasta_fallecimiento'),
                      icon: Icon(Icons.date_range),
                      label: Text(
                        _fechaFallecimientoHasta != null
                            ? 'Hasta: ${_formatDate(_fechaFallecimientoHasta!)}'
                            : 'Fecha Hasta',
                      ),
                    ),
                  ),
                ],
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
          case 'desde_nacimiento':
            _fechaNacimientoDesde = picked;
            break;
          case 'hasta_nacimiento':
            _fechaNacimientoHasta = picked;
            break;
          case 'desde_fallecimiento':
            _fechaFallecimientoDesde = picked;
            break;
          case 'hasta_fallecimiento':
            _fechaFallecimientoHasta = picked;
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
    });

    try {
      final resultados = await PersonajesRepository.searchPersonajes(
        nombre: _nombreController.text.trim().isNotEmpty ? _nombreController.text.trim() : null,
        lugarNacimiento: _lugarNacimientoController.text.trim().isNotEmpty ? _lugarNacimientoController.text.trim() : null,
        lugarFallecimiento: _lugarFallecimientoController.text.trim().isNotEmpty ? _lugarFallecimientoController.text.trim() : null,
        fechaNacimientoDesde: _fechaNacimientoDesde,
        fechaNacimientoHasta: _fechaNacimientoHasta,
        fechaFallecimientoDesde: _fechaFallecimientoDesde,
        fechaFallecimientoHasta: _fechaFallecimientoHasta,
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
      _fechaNacimientoDesde = null;
      _fechaNacimientoHasta = null;
      _fechaFallecimientoDesde = null;
      _fechaFallecimientoHasta = null;
      _estaVivo = false;
    });
  }
}