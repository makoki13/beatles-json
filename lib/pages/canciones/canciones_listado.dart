import 'package:flutter/material.dart';

class CancionesListadoPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Listado de Canciones'),
      ),
      body: Center(
        child: Text('Página con el listado de canciones'),
      ),
    );
  }
}