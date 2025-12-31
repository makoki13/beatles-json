import 'package:flutter/material.dart';
import 'package:beatles_json/models/personaje.dart';

class PersonajesTable extends StatelessWidget {
  final List<Personaje> personajes;
  final bool isLoading;
  final String? errorMessage;
  final Function(Personaje)? onPersonajeSelected; // Callback para cuando se selecciona un personaje

  const PersonajesTable({
    Key? key,
    required this.personajes,
    this.isLoading = false,
    this.errorMessage,
    this.onPersonajeSelected,
  }) : super(key: key);

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
          ],
        ),
      );
    }

    if (personajes.isEmpty) {
      return Center(
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
      );
    }

    return SingleChildScrollView(
      scrollDirection: Axis.vertical,
      child: DataTable(
        headingTextStyle: const TextStyle(
          fontWeight: FontWeight.bold,
          color: Colors.blue,
        ),
        columns: const [
          DataColumn(label: Text('Nombre')),
          DataColumn(label: Text('Nacimiento')),
          DataColumn(label: Text('Lugar Nacimiento')),
          DataColumn(label: Text('Fallecimiento')),
          DataColumn(label: Text('Lugar Fallecimiento')),
        ],
        rows: personajes.map((personaje) {
          return DataRow(
            selected: false, // No seleccionar filas por defecto
            onSelectChanged: (selected) {
              if (selected == true) {
                // Llamar al callback cuando se selecciona un personaje
                if (onPersonajeSelected != null) {
                  onPersonajeSelected!(personaje);
                }
              }
            },
            cells: [
              DataCell(Text(personaje.nombre)),
              DataCell(
                Text(
                  personaje.fechaNacimiento != null
                      ? _formatDate(personaje.fechaNacimiento!)
                      : '-',
                ),
              ),
              DataCell(Text(personaje.lugarNacimiento ?? '-')),
              DataCell(
                Text(
                  personaje.fechaFallecimiento != null
                      ? _formatDate(personaje.fechaFallecimiento!)
                      : '-',
                  style: personaje.fechaFallecimiento != null
                      ? const TextStyle(color: Colors.red)
                      : null,
                ),
              ),
              DataCell(Text(personaje.lugarFallecimiento ?? '-')),
            ],
          );
        }).toList(),
      ),
    );
  }

  static String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}