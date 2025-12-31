import 'package:flutter/material.dart';
import 'package:beatles_json/models/personaje.dart';
import 'package:beatles_json/repositories/personajes_repository.dart';
import 'package:beatles_json/components/personajes_table.dart';
import 'package:beatles_json/pages/personajes/personajes_add.dart';

class PersonajesListadoPage extends StatefulWidget {
  const PersonajesListadoPage({super.key});

  @override
  State<PersonajesListadoPage> createState() => _PersonajesListadoPageState();
}

class _PersonajesListadoPageState extends State<PersonajesListadoPage> {
  List<Personaje> personajes = [];
  bool isLoading = true;
  String? errorMessage;
  Personaje? _selectedPersonaje; // Personaje seleccionado para editar/eliminar

  @override
  void initState() {
    super.initState();
    _loadPersonajes();
  }

  @override
  void dispose() {
    super.dispose();
  }

  Future<void> _loadPersonajes() async {
    try {
      final data = await PersonajesRepository.getAllPersonajes();
      if (mounted) {
        setState(() {
          personajes = data;
          isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          errorMessage = 'Error al cargar los personajes: $e';
          isLoading = false;
        });
      }
    }
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

    // Si se actualizó el personaje, recargar la lista
    if (result == true) {
      _loadPersonajes();
    }
  }

  Future<void> _eliminarPersonaje(Personaje personaje) async {
    try {
      bool success = await PersonajesRepository.deletePersonaje(personaje.id);
      if (success) {
        if (mounted) {
          setState(() {
            personajes.removeWhere((p) => p.id == personaje.id);
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
    if (isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Cargando personajes...'),
          ],
        ),
      );
    }

    if (errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              "Error al cargar los datos",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.red,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              errorMessage!,
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadPersonajes,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Listado de Personajes'),
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
      body: PersonajesTable(
        personajes: personajes,
        isLoading: isLoading,
        errorMessage: errorMessage,
        onPersonajeSelected: (personaje) {
          setState(() {
            _selectedPersonaje = personaje;
          });
        },
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}