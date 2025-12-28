import 'package:flutter/material.dart';
import 'package:beatles_json/models/personaje.dart';
import 'package:beatles_json/repositories/personajes_repository.dart';

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
      body: personajes.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.person, size: 64, color: Colors.blue[400]),
                  const SizedBox(height: 16),
                  Text(
                    "No hay personajes registrados",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[700],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Agregue personajes para verlos aquí',
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ],
              ),
            )
          : ListView.builder(
              itemCount: personajes.length,
              itemBuilder: (context, index) {
                final personaje = personajes[index];
                return Card(
                  margin: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: CircleAvatar(
                      backgroundColor: Colors.blue[100],
                      child: Text(
                        personaje.nombre.substring(0, 1).toUpperCase(),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.blue,
                        ),
                      ),
                    ),
                    title: Text(
                      personaje.nombre,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (personaje.fechaNacimiento != null)
                          Text(
                            'Nacimiento: ${_formatDate(personaje.fechaNacimiento!)}',
                            style: const TextStyle(fontSize: 12),
                          ),
                        if (personaje.lugarNacimiento != null &&
                            personaje.lugarNacimiento!.isNotEmpty)
                          Text(
                            'Lugar: ${personaje.lugarNacimiento}',
                            style: const TextStyle(fontSize: 12),
                          ),
                        if (personaje.fechaFallecimiento != null)
                          Text(
                            'Fallecimiento: ${_formatDate(personaje.fechaFallecimiento!)}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.red,
                            ),
                          ),
                      ],
                    ),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  ),
                );
              },
            ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
