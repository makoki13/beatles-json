import 'package:flutter/material.dart';
import 'package:beatles_json/models/personaje.dart';
import 'package:beatles_json/repositories/personajes_repository.dart';
import 'package:beatles_json/components/personajes_table.dart';

class PersonajesListadoPage extends StatefulWidget {
  const PersonajesListadoPage({super.key});

  @override
  State<PersonajesListadoPage> createState() => _PersonajesListadoPageState();
}

class _PersonajesListadoPageState extends State<PersonajesListadoPage> {
  List<Personaje> personajes = [];
  bool isLoading = true;
  String? errorMessage;

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
      ),
      body: PersonajesTable(
        personajes: personajes,
        isLoading: isLoading,
        errorMessage: errorMessage,
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
