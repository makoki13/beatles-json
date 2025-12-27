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
  int selectedMenuItem = 0; // Índice de 'Personajes' en el menú superior
  String selectedContent = 'Listado'; // Valor inicial para el contenido

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Menú superior
          MainMenu(
            onSectionChanged: (String section, int index) {
              setState(() {
                selectedSection = section;
                selectedMenuItem = index;
                // No establecer selectedContent aquí, dejar que SideMenu maneje la selección del primer elemento
              });
            },
            currentIndex: selectedMenuItem,
          ),
          // Cuerpo principal con menú lateral y área de contenido
          Expanded(
            child: Row(
              children: [
                // Menú lateral izquierdo
                SideMenu(
                  section: selectedSection,
                  onContentChanged: (String content) {
                    setState(() {
                      selectedContent = content;
                    });
                  },
                  activeAction: selectedContent,
                ),
                // Área de contenido principal
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