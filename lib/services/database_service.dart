// ignore_for_file: avoid_print

import 'dart:async';
import 'package:postgres/postgres.dart';
import '../models/personaje.dart';

class DatabaseService {
  late Connection _connection;

  static const String _host = 'localhost';
  static const int _port = 5432;
  static const String _databaseName = 'beatles';
  static const String _username = 'postgres';
  static const String _password = 'J0P4G3R1#beatles';

  Future<void> connect() async {
    try {
      _connection = await Connection.open(
        Endpoint(
          host: _host,
          port: _port,
          database: _databaseName,
          username: _username,
          password: _password,
        ),
      );
      print('Conexión a la base de datos establecida exitosamente');
    } catch (e) {
      print('Error al conectar a la base de datos: $e');
      rethrow;
    }
  }

  Future<void> disconnect() async {
    await _connection.close();
  }

  // Métodos para la tabla personajes
  Future<List<Personaje>> getAllPersonajes() async {
    try {
      final results = await _connection.execute(
        'SELECT * FROM personajes ORDER BY nombre',
      );

      return results.map((row) => _mapRowToPersonaje(row)).toList();
    } catch (e) {
      print('Error al obtener personajes: $e');
      rethrow;
    }
  }

  Future<Personaje?> getPersonajeById(int id) async {
    try {
      final results = await _connection.execute(
        'SELECT * FROM personajes WHERE id = $id',
      );

      if (results.isNotEmpty) {
        return _mapRowToPersonaje(results.first);
      }
      return null;
    } catch (e) {
      print('Error al obtener personaje por ID: $e');
      rethrow;
    }
  }

  Future<int> insertPersonaje(Personaje personaje) async {
    try {
      final results = await _connection.execute('''INSERT INTO personajes (
            nombre, 
            fecha_nacimiento, 
            lugar_nacimiento, 
            fecha_fallecimiento, 
            lugar_fallecimiento
          ) 
          VALUES (
            '$personaje.nombre', 
           '$personaje.fechaNacimiento?.toIso8601String()', 
           $personaje.lugarNacimiento, 
           $personaje.fechaFallecimiento?.toIso8601String(), 
           $personaje.lugarFallecimiento
          ) 
          RETURNING id''');

      final row = results.first;
      return row[0] as int;
    } catch (e) {
      print('Error al insertar personaje: $e');
      rethrow;
    }
  }

  Future<void> updatePersonaje(Personaje personaje) async {
    try {
      await _connection.execute(
        '''UPDATE personajes SET 
           nombre = '$personaje.nombre', 
           fecha_nacimiento = '$personaje.fechaNacimiento?.toIso8601String()', 
           lugar_nacimiento = '$personaje.lugarNacimiento', 
           fecha_fallecimiento = '$personaje.fechaFallecimiento?.toIso8601String()', 
           lugar_fallecimiento = '$personaje.lugarFallecimiento' 
           WHERE id = @id'''
      );
    } catch (e) {
      print('Error al actualizar personaje: $e');
      rethrow;
    }
  }

  Future<void> deletePersonaje(int id) async {
    try {
      await _connection.execute('DELETE FROM personajes WHERE id = $id');
    } catch (e) {
      print('Error al eliminar personaje: $e');
      rethrow;
    }
  }

  // Método auxiliar para convertir fila de PostgreSQL a Personaje
  Personaje _mapRowToPersonaje(ResultRow row) {
    return Personaje.fromJson({
      'id': row[0],
      'nombre': row[1],
      'fecha_nacimiento': row[2],
      'lugar_nacimiento': row[3],
      'fecha_fallecimiento': row[4],
      'lugar_fllecimiento': row[5],
    });
  }
}
