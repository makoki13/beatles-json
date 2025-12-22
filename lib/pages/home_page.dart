import 'package:beatles_json/widgets/content_area.dart';
import 'package:beatles_json/widgets/main_menu.dart';
import 'package:beatles_json/widgets/side_menu.dart';
import 'package:flutter/material.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String selectedSection = 'Personajes'; // Valor inicial
  int selectedMenuItem = 0; // �ndice de 'Personajes' en el men� superior
  String selectedContent = 'Listado'; // Valor inicial para el contenido

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Men� superior
          MainMenu(
            onSectionChanged: (String section, int index) {
              setState(() {
                selectedSection = section;
                selectedMenuItem = index;
                selectedContent = 'Listado'; // Reiniciar al cambiar secci�n
              });
            },
            currentIndex: selectedMenuItem,
          ),
          // Cuerpo principal con men� lateral y �rea de contenido
          Expanded(
            child: Row(
              children: [
                // Men� lateral izquierdo
                SideMenu(
                  section: selectedSection,
                  onContentChanged: (String content) {
                    setState(() {
                      selectedContent = content;
                    });
                  },
                ),
                // �rea de contenido principal
                Expanded(
                  child: ContentArea(
                    section: selectedSection,
                    content: selectedContent,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
