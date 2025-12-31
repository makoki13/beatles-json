import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class DatabaseService {
  // Base URL for your API server
  // Use different URLs depending on the platform
  static String get _baseUrl {
    if (kIsWeb) {
      // For web, use localhost
      return 'http://localhost:8080';
    } else {
      // For mobile, use 10.0.2.2 for Android emulator to reach host machine
      return 'http://10.0.2.2:8080';
    }
  }

  // Get all personajes
  static Future<List<Map<String, dynamic>>> getAllPersonajes() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/personajes'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception('Failed to load personajes: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching personajes: $e');
      rethrow;
    }
  }

  // Get personaje by ID
  static Future<Map<String, dynamic>?> getPersonajeById(int id) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/personajes/$id'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else if (response.statusCode == 404) {
        return null; // Personaje not found
      } else {
        throw Exception('Failed to load personaje: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching personaje: $e');
      rethrow;
    }
  }

  // Create a new personaje
  static Future<int> createPersonaje(Map<String, dynamic> personajeData) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/personajes'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(personajeData),
      );

      print("PersonajeData: " + personajeData.toString());

      if (response.statusCode == 201) {
        final createdPersonaje = json.decode(response.body);
        return createdPersonaje['id'];
      } else {
        throw Exception('Failed to create personaje: ${response.statusCode}');
      }
    } catch (e) {
      print('Error creating personaje: $e');
      rethrow;
    }
  }

  // Update an existing personaje
  static Future<bool> updatePersonaje(
    int id,
    Map<String, dynamic> personajeData,
  ) async {
    try {
      final response = await http.put(
        Uri.parse('$_baseUrl/personajes/$id'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(personajeData),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error updating personaje: $e');
      rethrow;
    }
  }

  // Delete a personaje
  static Future<bool> deletePersonaje(int id) async {
    try {
      final response = await http.delete(
        Uri.parse('$_baseUrl/personajes/$id'),
        headers: {'Content-Type': 'application/json'},
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error deleting personaje: $e');
      rethrow;
    }
  }

  // Search personajes with filters
  static Future<List<Map<String, dynamic>>> searchPersonajes({
    String? nombre,
    String? lugarNacimiento,
    String? lugarFallecimiento,
    DateTime? fechaNacimiento,
    DateTime? fechaFallecimiento,
    bool? estaVivo,
  }) async {
    try {
      // Build query parameters
      Map<String, String> queryParams = {};

      if (nombre != null && nombre.isNotEmpty) {
        queryParams['nombre'] = nombre;
      }
      if (lugarNacimiento != null && lugarNacimiento.isNotEmpty) {
        queryParams['lugar_nacimiento'] = lugarNacimiento;
      }
      if (lugarFallecimiento != null && lugarFallecimiento.isNotEmpty) {
        queryParams['lugar_fallecimiento'] = lugarFallecimiento;
      }
      if (fechaNacimiento != null) {
        queryParams['fecha_nacimiento'] = fechaNacimiento
            .toIso8601String()
            .split('T')[0];
      }
      if (fechaFallecimiento != null) {
        queryParams['fecha_fallecimiento'] = fechaFallecimiento
            .toIso8601String()
            .split('T')[0];
      }      
      if (estaVivo != null) {
        queryParams['esta_vivo'] = estaVivo.toString();
      }

      String queryString = Uri(queryParameters: queryParams).query;
      String url = '$_baseUrl/personajes/buscar';
      if (queryString.isNotEmpty) {
        url += '?$queryString';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception('Failed to search personajes: ${response.statusCode}');
      }
    } catch (e) {
      print('Error searching personajes: $e');
      rethrow;
    }
  }
}
