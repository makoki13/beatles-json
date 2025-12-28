import 'dart:convert';
import 'package:http/http.dart' as http;

class DatabaseService {
  // Base URL for your API server
  static const String _baseUrl = 'http://localhost:8080'; // Replace with your API server URL

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
  static Future<bool> updatePersonaje(int id, Map<String, dynamic> personajeData) async {
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
}