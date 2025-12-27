import 'package:flutter/material.dart';

class PersonajesListadoPage extends StatelessWidget {
  const PersonajesListadoPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.list,
            size: 64,
            color: Colors.blue[400],
          ),
          SizedBox(height: 16),
          Text(
            "Listado de Personajes",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.grey[700],
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Aquí se mostrará el listado de personajes',
            style: TextStyle(fontSize: 14, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}