import 'package:flutter/material.dart';

class CancionesAddPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Agregar Canción'),
      ),
      body: Center(
        child: Text('Página para agregar una nueva canción'),
      ),
    );
  }
}