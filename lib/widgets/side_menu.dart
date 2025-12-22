import 'package:flutter/material.dart';

class SideMenu extends StatelessWidget {
  final String section;
  final Function(String) onContentChanged;

  const SideMenu({
    super.key,
    required this.section,
    required this.onContentChanged,
  });

  @override
  Widget build(BuildContext context) {
    // Opciones de menú que cambian según la sección seleccionada
    List<Map<String, String>> menuOptions = [];
    switch (section) {
      case 'Personajes':
        menuOptions = [
          {'title': 'Listado', 'action': 'List'},
          {'title': 'Buscar', 'action': 'Search'},
          {'title': 'Añadir', 'action': 'Add'},
        ];
        break;
      case 'Canciones':
        menuOptions = [
          {'title': 'Listado', 'action': 'Listado'},
          {'title': 'Agregar', 'action': 'Agregar'},
          {'title': 'Editar', 'action': 'Editar'},
        ];
        break;
      case 'Sesiones':
        menuOptions = [
          {'title': 'Listado', 'action': 'Listado'},
          {'title': 'Agregar', 'action': 'Agregar'},
          {'title': 'Editar', 'action': 'Editar'},
        ];
        break;
      case 'Grabaciones':
        menuOptions = [
          {'title': 'Listado', 'action': 'Listado'},
          {'title': 'Agregar', 'action': 'Agregar'},
          {'title': 'Editar', 'action': 'Editar'},
        ];
        break;
      case 'Demos':
        menuOptions = [
          {'title': 'Listado', 'action': 'Listado'},
          {'title': 'Agregar', 'action': 'Agregar'},
          {'title': 'Editar', 'action': 'Editar'},
        ];
        break;
      case 'Estudio':
        menuOptions = [
          {'title': 'Listado', 'action': 'Listado'},
          {'title': 'Agregar', 'action': 'Agregar'},
          {'title': 'Editar', 'action': 'Editar'},
        ];
        break;
      case 'Actuaciones':
        menuOptions = [
          {'title': 'Listado', 'action': 'Listado'},
          {'title': 'Agregar', 'action': 'Agregar'},
          {'title': 'Editar', 'action': 'Editar'},
        ];
        break;
      case 'Entrevistas':
        menuOptions = [
          {'title': 'Listado', 'action': 'Listado'},
          {'title': 'Agregar', 'action': 'Agregar'},
          {'title': 'Editar', 'action': 'Editar'},
        ];
        break;
      case 'Remixes':
        menuOptions = [
          {'title': 'Listado', 'action': 'Listado'},
          {'title': 'Agregar', 'action': 'Agregar'},
          {'title': 'Editar', 'action': 'Editar'},
        ];
        break;
      case 'Obras':
        menuOptions = [
          {'title': 'Listado', 'action': 'Listado'},
          {'title': 'Agregar', 'action': 'Agregar'},
          {'title': 'Editar', 'action': 'Editar'},
        ];
        break;
      case 'Másters':
        menuOptions = [
          {'title': 'Listado', 'action': 'Listado'},
          {'title': 'Agregar', 'action': 'Agregar'},
          {'title': 'Editar', 'action': 'Editar'},
        ];
        break;
      case 'Discográficas':
        menuOptions = [
          {'title': 'Listado', 'action': 'Listado'},
          {'title': 'Agregar', 'action': 'Agregar'},
          {'title': 'Editar', 'action': 'Editar'},
        ];
        break;
      case 'Publicaciones':
        menuOptions = [
          {'title': 'Listado', 'action': 'Listado'},
          {'title': 'Agregar', 'action': 'Agregar'},
          {'title': 'Editar', 'action': 'Editar'},
        ];
        break;
      default:
        menuOptions = [
          {'title': 'Listado', 'action': 'Listado'},
          {'title': 'Agregar', 'action': 'Agregar'},
          {'title': 'Editar', 'action': 'Editar'},
        ];
    }

    return Container(
      width: 200,
      decoration: BoxDecoration(
        color: Colors.grey[100],
        border: Border(
          right: BorderSide(color: Colors.grey.shade300, width: 1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Divider(height: 10),
          Expanded(
            child: ListView.builder(
              itemCount: menuOptions.length,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text(menuOptions[index]['title']!),
                  onTap: () {
                    onContentChanged(menuOptions[index]['action']!);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
