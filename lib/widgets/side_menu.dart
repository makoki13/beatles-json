import 'package:flutter/material.dart';

class SideMenu extends StatefulWidget {
  final String section;
  final String activeAction;
  final Function(String) onContentChanged;

  const SideMenu({
    super.key,
    required this.section,
    required this.activeAction,
    required this.onContentChanged,
  });

  @override
  State<SideMenu> createState() => _SideMenuState();
}

class _SideMenuState extends State<SideMenu> {
  @override
  void didUpdateWidget(SideMenu oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Si la sección cambia, seleccionar automáticamente la primera opción del menú
    if (oldWidget.section != widget.section) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _selectFirstOption();
        }
      });
    }
  }

  void _selectFirstOption() {
    List<Map<String, String>> menuOptions = _getMenuOptionsForSection(widget.section);
    if (menuOptions.isNotEmpty) {
      widget.onContentChanged(menuOptions[0]['action']!);
    }
  }

  List<Map<String, String>> _getMenuOptionsForSection(String section) {
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
          {'title': 'Listado', 'action': 'List'},
          {'title': 'Agregar', 'action': 'Search'},
          {'title': 'Editar', 'action': 'Add'},
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
    return menuOptions;
  }

  @override
  Widget build(BuildContext context) {
    // Opciones de menú que cambian según la sección seleccionada
    List<Map<String, String>> menuOptions = _getMenuOptionsForSection(widget.section);

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
          Divider(height: 10, color: Colors.grey[100]),
          Expanded(
            child: ListView.builder(
              itemCount: menuOptions.length,
              itemBuilder: (context, index) {
                final option = menuOptions[index];
                bool isSelected = option['action'] == widget.activeAction;

                return Container(
                  margin: EdgeInsets.symmetric(horizontal: 8.0, vertical: 2.0),
                  child: ElevatedButton(
                    onPressed: () {
                      widget.onContentChanged(option['action']!);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isSelected
                          ? Colors.blue[100]
                          : Colors.white,
                      foregroundColor: isSelected
                          ? Colors.blue[800]
                          : Colors.blue[700],
                      side: BorderSide(
                        color: isSelected
                            ? Colors.blue.shade400
                            : Colors.blue.shade200,
                      ),
                      padding: EdgeInsets.symmetric(
                        horizontal: 12.0,
                        vertical: 12.0,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(6.0),
                      ),
                    ),
                    child: Text(
                      option['title']!,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: isSelected
                            ? FontWeight.bold
                            : FontWeight.w500,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
