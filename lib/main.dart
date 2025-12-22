import 'package:flutter/material.dart';
import 'package:beatles_json/pages/home_page.dart';

void main() {
  runApp(const BeatlesJsonApp());
}

class BeatlesJsonApp extends StatelessWidget {
  const BeatlesJsonApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Beatles JSON Generator',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const HomePage(),
      debugShowCheckedModeBanner: false,
    );
  }
}