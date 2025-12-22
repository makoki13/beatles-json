import 'package:flutter/material.dart';

class MainMenu extends StatelessWidget implements PreferredSizeWidget {
  final Function(String, int) onSectionChanged;
  final int currentIndex;

  MainMenu({
    super.key,
    required this.onSectionChanged,
    required this.currentIndex,
  });

  final List<String> sections = [
    'Personajes',
    'Canciones',
    'Sesiones',
    'Grabaciones',
    'Demos',
    'Estudio',
    'Actuaciones',
    'Entrevistas',
    'Remixes',
    'Obras',
    'Másters',
    'Discográficas',
    'Publicaciones',
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 60.0,
      decoration: BoxDecoration(
        color: Colors.grey[800],
        boxShadow: [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 4.0,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: sections.length,
        separatorBuilder: (context, index) => SizedBox(width: 1),
        itemBuilder: (context, index) {
          return TextButton(
            onPressed: () {
              onSectionChanged(sections[index], index);
            },
            style: ButtonStyle(
              backgroundColor: WidgetStateProperty.all<Color>(
                currentIndex == index ? Colors.blue[700]! : Colors.grey[700]!,
              ),
              foregroundColor: WidgetStateProperty.all<Color>(Colors.white),
              padding: WidgetStateProperty.all<EdgeInsetsGeometry>(
                EdgeInsets.symmetric(horizontal: 16.0),
              ),
              shape: WidgetStateProperty.all<OutlinedBorder>(
                RoundedRectangleBorder(side: BorderSide.none),
              ),
            ),
            child: Text(sections[index], style: TextStyle(fontSize: 14)),
          );
        },
      ),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(60.0);
}
