import '../models/personaje.dart';
import '../services/database_service.dart';

class PersonajesRepository {
  static Future<List<Personaje>> getAllPersonajes() async {
    try {
      final data = await DatabaseService.getAllPersonajes();
      return data.map((json) => Personaje.fromJson(json)).toList();
    } catch (e) {
      print('Error al obtener personajes: $e');
      rethrow;
    }
  }

  static Future<Personaje?> getPersonajeById(int id) async {
    try {
      final data = await DatabaseService.getPersonajeById(id);
      if (data != null) {
        return Personaje.fromJson(data);
      }
      return null;
    } catch (e) {
      print('Error al obtener personaje por ID: $e');
      rethrow;
    }
  }

  static Future<int> createPersonaje(Personaje personaje) async {
    try {
      final personajeData = personaje.toJson();
      return await DatabaseService.createPersonaje(personajeData);
    } catch (e) {
      print('Error al crear personaje: $e');
      rethrow;
    }
  }

  static Future<bool> updatePersonaje(Personaje personaje) async {
    try {
      final personajeData = personaje.toJson();
      return await DatabaseService.updatePersonaje(personaje.id, personajeData);
    } catch (e) {
      print('Error al actualizar personaje: $e');
      rethrow;
    }
  }

  static Future<bool> deletePersonaje(int id) async {
    try {
      return await DatabaseService.deletePersonaje(id);
    } catch (e) {
      print('Error al eliminar personaje: $e');
      rethrow;
    }
  }

  static Future<List<Personaje>> searchPersonajes({
    String? nombre,
    String? lugarNacimiento,
    String? lugarFallecimiento,
    DateTime? fechaNacimiento,
    DateTime? fechaFallecimiento,
    bool? estaVivo,
  }) async {
    try {
      final data = await DatabaseService.searchPersonajes(
        nombre: nombre,
        lugarNacimiento: lugarNacimiento,
        lugarFallecimiento: lugarFallecimiento,
        fechaNacimiento: fechaNacimiento,
        fechaFallecimiento: fechaFallecimiento,
        estaVivo: estaVivo,
      );
      return data.map((json) => Personaje.fromJson(json)).toList();
    } catch (e) {
      print('Error al buscar personajes: $e');
      rethrow;
    }
  }
}