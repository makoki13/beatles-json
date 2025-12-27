import 'package:beatles_json/pages/canciones/canciones_add.dart';
import 'package:beatles_json/pages/canciones/canciones_buscar.dart';
import 'package:beatles_json/pages/canciones/canciones_listado.dart';
import 'package:beatles_json/pages/list_page.dart';
import 'package:beatles_json/pages/personajes/personajes_add.dart';
import 'package:beatles_json/pages/personajes/personajes_buscar.dart';
import 'package:beatles_json/pages/personajes/personajes_listado.dart';
import 'package:beatles_json/pages/search_page.dart';
import 'package:beatles_json/pages/add_page.dart';
import 'package:flutter/material.dart';

class ContentArea extends StatelessWidget {
  final String section;
  final String content;
  const ContentArea({super.key, required this.section, required this.content});

  @override
  Widget build(BuildContext context) {
    Widget contentWidget;

    // Determinar qué widget mostrar según la sección y el contenido
    switch (section) {
      case 'Personajes':
        switch (content) {
          case 'List':
            contentWidget = PersonajesListadoPage();
            break;
          case 'Search':
            contentWidget = PersonajesBuscarPage();
            break;
          case 'Add':
            contentWidget = PersonajesAddPage();
            break;
          default:
            contentWidget = Scaffold(
              appBar: AppBar(title: Text('Cargando...')),
              body: Center(child: Text('Cargando datos de personajes')),
            );
        }
        break;
      case 'Canciones':
        switch (content) {
          case 'List':
            contentWidget = CancionesListadoPage();
            break;
          case 'Search':
            contentWidget = CancionesBuscarPage();
            break;
          case 'Add':
            contentWidget = CancionesAddPage();
            break;
          default:
            contentWidget = Scaffold(
              appBar: AppBar(title: Text('Cargando...')),
              body: Center(child: Text('Cargando datos de canciones')),
            );
        }
        break;
      default:
        switch (content) {
          case 'Listado':
          case 'List':
            contentWidget = ListPage(section: section);
            break;
          case 'Agregar':
          case 'Add':
            contentWidget = AddPage(section: section);
            break;
          case 'Editar':
            contentWidget = _buildEditPage(section);
            break;
          case 'Buscar':
          case 'Search':
            contentWidget = SearchPage(section: section);
            break;
          default:
            contentWidget = _buildDefaultPage(section, content);
        }
    }

    return Container(
      padding: EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Card(
              elevation: 2,
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: contentWidget,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEditPage(String section) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.edit, size: 64, color: Colors.purple[400]),
          SizedBox(height: 16),
          Text(
            "Editar $section",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.grey[700],
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Aquí se mostrará la funcionalidad de edición para $section',
            style: TextStyle(fontSize: 14, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  Widget _buildDefaultPage(String section, String content) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.help_outline, size: 64, color: Colors.grey[400]),
          SizedBox(height: 16),
          Text(
            "Página: $content",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.grey[700],
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Área de contenido para $section - $content',
            style: TextStyle(fontSize: 14, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}
