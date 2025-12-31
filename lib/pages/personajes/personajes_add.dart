import 'package:flutter/material.dart';
import 'package:beatles_json/models/personaje.dart';
import 'package:beatles_json/repositories/personajes_repository.dart';

class PersonajesAddPage extends StatefulWidget {
  final Personaje? personaje; // Parámetro opcional para edición

  const PersonajesAddPage({Key? key, this.personaje}) : super(key: key);

  @override
  _PersonajesAddPageState createState() => _PersonajesAddPageState();
}

class _PersonajesAddPageState extends State<PersonajesAddPage> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nombreController;
  late final TextEditingController _lugarNacimientoController;
  late final TextEditingController _lugarFallecimientoController;

  DateTime? _fechaNacimiento;
  DateTime? _fechaFallecimiento;

  bool _isLoading = false;
  late bool _isEditing; // Indicador para saber si estamos editando

  @override
  void initState() {
    super.initState();
    
    // Determinar si estamos en modo edición
    _isEditing = widget.personaje != null;
    
    // Inicializar controladores con valores existentes si estamos editando
    _nombreController = TextEditingController(
      text: _isEditing ? widget.personaje!.nombre : '',
    );
    _lugarNacimientoController = TextEditingController(
      text: _isEditing ? widget.personaje!.lugarNacimiento ?? '' : '',
    );
    _lugarFallecimientoController = TextEditingController(
      text: _isEditing ? widget.personaje!.lugarFallecimiento ?? '' : '',
    );
    
    // Inicializar fechas si estamos editando
    if (_isEditing) {
      _fechaNacimiento = widget.personaje!.fechaNacimiento;
      _fechaFallecimiento = widget.personaje!.fechaFallecimiento;
    }
  }

  @override
  void dispose() {
    _nombreController.dispose();
    _lugarNacimientoController.dispose();
    _lugarFallecimientoController.dispose();
    super.dispose();
  }

  Future<void> _selectFechaNacimiento() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _fechaNacimiento ?? DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() {
        _fechaNacimiento = picked;
      });
    }
  }

  Future<void> _selectFechaFallecimiento() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _fechaFallecimiento ?? DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() {
        _fechaFallecimiento = picked;
      });
    }
  }

  Future<void> _submitForm() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        final personaje = Personaje(
          id: _isEditing ? widget.personaje!.id : 0, // Mantener ID si estamos editando
          nombre: _nombreController.text.trim(),
          fechaNacimiento: _fechaNacimiento,
          lugarNacimiento: _lugarNacimientoController.text.trim().isEmpty ? null : _lugarNacimientoController.text.trim(),
          fechaFallecimiento: _fechaFallecimiento,
          lugarFallecimiento: _lugarFallecimientoController.text.trim().isEmpty ? null : _lugarFallecimientoController.text.trim(),
        );

        if (_isEditing) {
          // Actualizar personaje existente
          await PersonajesRepository.updatePersonaje(personaje);
        } else {
          // Crear nuevo personaje
          await PersonajesRepository.createPersonaje(personaje);
        }

        if (mounted) {
          setState(() {
            _isLoading = false;
          });

          // Mostrar mensaje de éxito
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(_isEditing 
                ? 'Personaje actualizado exitosamente' 
                : 'Personaje agregado exitosamente'),
              backgroundColor: Colors.green,
            ),
          );

          // Regresar a la página anterior con indicador de éxito
          Navigator.of(context).pop(true);
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });

          // Mostrar mensaje de error
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(_isEditing 
                ? 'Error al actualizar personaje: $e' 
                : 'Error al agregar personaje: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  void _resetForm() {
    _formKey.currentState?.reset();
    _nombreController.clear();
    _lugarNacimientoController.clear();
    _lugarFallecimientoController.clear();
    setState(() {
      _fechaNacimiento = null;
      _fechaFallecimiento = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Editar Personaje' : 'Agregar Personaje'),
        backgroundColor: Colors.blue[600],
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Campo de nombre
                TextFormField(
                  controller: _nombreController,
                  decoration: const InputDecoration(
                    labelText: 'Nombre *',
                    hintText: 'Ingrese el nombre del personaje',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.person),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Por favor ingrese un nombre';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Campo de lugar de nacimiento
                TextFormField(
                  controller: _lugarNacimientoController,
                  decoration: const InputDecoration(
                    labelText: 'Lugar de Nacimiento',
                    hintText: 'Ingrese el lugar de nacimiento',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.location_on),
                  ),
                ),
                const SizedBox(height: 16),

                // Selector de fecha de nacimiento
                Container(
                  width: double.infinity,
                  height: 60,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: TextButton.icon(
                    onPressed: _selectFechaNacimiento,
                    icon: const Icon(Icons.calendar_today),
                    label: Text(
                      _fechaNacimiento != null
                          ? 'Fecha de Nacimiento: ${_formatDate(_fechaNacimiento!)}'
                          : 'Seleccionar Fecha de Nacimiento',
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Campo de lugar de fallecimiento
                TextFormField(
                  controller: _lugarFallecimientoController,
                  decoration: const InputDecoration(
                    labelText: 'Lugar de Fallecimiento',
                    hintText: 'Ingrese el lugar de fallecimiento',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.place),
                  ),
                ),
                const SizedBox(height: 16),

                // Selector de fecha de fallecimiento
                Container(
                  width: double.infinity,
                  height: 60,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: TextButton.icon(
                    onPressed: _selectFechaFallecimiento,
                    icon: const Icon(Icons.calendar_today),
                    label: Text(
                      _fechaFallecimiento != null
                          ? 'Fecha de Fallecimiento: ${_formatDate(_fechaFallecimiento!)}'
                          : 'Seleccionar Fecha de Fallecimiento',
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // Botón de submit
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _submitForm,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue[600],
                      foregroundColor: Colors.white,
                    ),
                    child: _isLoading
                        ? const CircularProgressIndicator()
                        : Text(
                            _isEditing ? 'Actualizar Personaje' : 'Agregar Personaje',
                            style: const TextStyle(fontSize: 16),
                          ),
                  ),
                ),

                // Botón para limpiar formulario
                if (!_isEditing) ...[
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: OutlinedButton(
                      onPressed: _isLoading ? null : _resetForm,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                      ),
                      child: const Text(
                        'Limpiar Formulario',
                        style: TextStyle(fontSize: 16),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}