import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
import 'package:shelf_router/shelf_router.dart';
import 'package:shelf_cors_headers/shelf_cors_headers.dart';
import 'package:postgres/postgres.dart';

// 🔐 Configuración
final String dbHost = 'localhost'; // ← cámbialo si es remoto
final int dbPort = 5433; // ✅ ¡Ahora usamos el puerto 5433!
final String dbName = 'beatles';
final String dbUser = 'postgres';
final String dbPass = 'J0P4G3R1#beatles';

late PostgreSQLConnection conexion; // ✅ Clase correcta en v2.x

Future<void> main() async {
  // ✅ Conexión usando PostgreSQLConnection (v2.x)
  conexion = PostgreSQLConnection(
    dbHost,
    dbPort,
    dbName,
    username: dbUser,
    password: dbPass,
  );

  await conexion.open(); // ← ¡Así se abre en v2.x!
  print('✅ Conectado a PostgreSQL en $dbHost:$dbPort / base "$dbName"');

  final router = Router()
    ..get('/personajes', _obtenerPersonajes)
    ..get('/personajes/buscar', _buscarPersonajes)
    ..post('/personajes', _crearPersonaje)
    ..put('/personajes/<id>', _actualizarPersonaje)
    ..delete('/personajes/<id>', _eliminarPersonaje)
    ..get('/personajes/<id>', _obtenerPersonajePorId);

  final handler = const Pipeline()
      .addMiddleware(logRequests())
      .addMiddleware(corsHeaders())
      .addHandler(router);

  final server = await io.serve(handler, '127.0.0.1', 8080);
  print('🚀 Servidor listo en http://${server.address.host}:${server.port}');
}

Future<Response> _obtenerPersonajes(Request req) async {
  try {
    // En v2.x, se usa .query()
    final resultados = await conexion.query(
      'SELECT id, nombre, fecha_nacimiento, lugar_nacimiento, '
      'fecha_fallecimiento, lugar_fallecimiento FROM personajes;',
    );

    final lista = resultados.map((fila) {
      // En v2.x, los valores se acceden por índice: fila[0], fila[1], etc.
      DateTime? parseDate(dynamic val) => val is DateTime ? val : null;

      return {
        'id': fila[0],
        'nombre': fila[1],
        'fecha_nacimiento': _formatDate(parseDate(fila[2])),
        'lugar_nacimiento': fila[3],
        'fecha_fallecimiento': _formatDate(parseDate(fila[4])),
        'lugar_fallecimiento': fila[5],
      };
    }).toList();

    return Response.ok(
      jsonEncode(lista),
      headers: {'Content-Type': 'application/json; charset=utf-8'},
    );
  } catch (e, stack) {
    print('❌ Error: $e\nStack: $stack');
    return Response.internalServerError(body: 'Error al cargar personajes');
  }
}

String? _formatDate(DateTime? d) {
  if (d == null) return null;
  return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
}

Future<Response> _crearPersonaje(Request req) async {
  try {
    final body = await req.readAsString();
    final jsonData = jsonDecode(body);

    // Validate required fields
    if (jsonData['nombre'] == null || jsonData['nombre'].toString().trim().isEmpty) {
      return Response.badRequest(
        body: jsonEncode({'error': 'El nombre es requerido'}),
      );
    }

    // Prepare the query and parameters
    String query = '''
      INSERT INTO personajes (nombre, fecha_nacimiento, lugar_nacimiento, fecha_fallecimiento, lugar_fallecimiento)
      VALUES (\$1, \$2, \$3, \$4, \$5)
      RETURNING id;
    ''';

    List<dynamic> parameters = [
      jsonData['nombre'].toString().trim(),
      jsonData['fecha_nacimiento'] != null && jsonData['fecha_nacimiento'].toString().isNotEmpty
        ? DateTime.parse(jsonData['fecha_nacimiento'].toString())
        : null,
      jsonData['lugar_nacimiento'] != null && jsonData['lugar_nacimiento'].toString().trim().isNotEmpty
        ? jsonData['lugar_nacimiento'].toString().trim()
        : null,
      jsonData['fecha_fallecimiento'] != null && jsonData['fecha_fallecimiento'].toString().isNotEmpty
        ? DateTime.parse(jsonData['fecha_fallecimiento'].toString())
        : null,
      jsonData['lugar_fallecimiento'] != null && jsonData['lugar_fallecimiento'].toString().trim().isNotEmpty
        ? jsonData['lugar_fallecimiento'].toString().trim()
        : null,
    ];

    final resultados = await conexion.query(
      query,
      substitutionValues: {
        for (int i = 0; i < parameters.length; i++) '${i + 1}': parameters[i],
      },
    );

    if (resultados.isNotEmpty) {
      final nuevoId = resultados.first[0] as int;

      return Response(201,
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        body: jsonEncode({'id': nuevoId}),
      );
    } else {
      return Response.internalServerError(
        body: jsonEncode({'error': 'No se pudo crear el personaje'}),
      );
    }
  } catch (e, stack) {
    print('❌ Error al crear personaje: $e\nStack: $stack');
    return Response.internalServerError(
      body: jsonEncode({'error': 'Error al crear personaje: $e'}),
    );
  }
}

Future<Response> _obtenerPersonajePorId(Request req, String id) async {
  try {
    final resultados = await conexion.query(
      'SELECT id, nombre, fecha_nacimiento, lugar_nacimiento, '
      'fecha_fallecimiento, lugar_fallecimiento FROM personajes WHERE id = \$1;',
      substitutionValues: {'1': int.tryParse(id) ?? 0},
    );

    if (resultados.isNotEmpty) {
      final fila = resultados.first;
      DateTime? parseDate(dynamic val) => val is DateTime ? val : null;

      final personaje = {
        'id': fila[0],
        'nombre': fila[1],
        'fecha_nacimiento': _formatDate(parseDate(fila[2])),
        'lugar_nacimiento': fila[3],
        'fecha_fallecimiento': _formatDate(parseDate(fila[4])),
        'lugar_fallecimiento': fila[5],
      };

      return Response.ok(
        jsonEncode(personaje),
        headers: {'Content-Type': 'application/json; charset=utf-8'},
      );
    } else {
      return Response.notFound(jsonEncode({'error': 'Personaje no encontrado'}));
    }
  } catch (e, stack) {
    print('❌ Error al obtener personaje por ID: $e\nStack: $stack');
    return Response.internalServerError(
      body: jsonEncode({'error': 'Error al obtener personaje: $e'}),
    );
  }
}

Future<Response> _actualizarPersonaje(Request req, String id) async {
  try {
    final body = await req.readAsString();
    final jsonData = jsonDecode(body);

    // Build the update query dynamically based on provided fields
    List<String> setParts = [];
    List<dynamic> parameters = [];
    int paramIndex = 1;

    if (jsonData.containsKey('nombre') && jsonData['nombre'] != null) {
      setParts.add('nombre = \$${paramIndex}');
      parameters.add(jsonData['nombre'].toString().trim());
      paramIndex++;
    }

    if (jsonData.containsKey('fecha_nacimiento')) {
      if (jsonData['fecha_nacimiento'] != null && jsonData['fecha_nacimiento'].toString().isNotEmpty) {
        setParts.add('fecha_nacimiento = \$${paramIndex}');
        parameters.add(DateTime.parse(jsonData['fecha_nacimiento'].toString()));
      } else {
        setParts.add('fecha_nacimiento = NULL');
      }
      paramIndex++;
    }

    if (jsonData.containsKey('lugar_nacimiento')) {
      if (jsonData['lugar_nacimiento'] != null && jsonData['lugar_nacimiento'].toString().trim().isNotEmpty) {
        setParts.add('lugar_nacimiento = \$${paramIndex}');
        parameters.add(jsonData['lugar_nacimiento'].toString().trim());
      } else {
        setParts.add('lugar_nacimiento = NULL');
      }
      paramIndex++;
    }

    if (jsonData.containsKey('fecha_fallecimiento')) {
      if (jsonData['fecha_fallecimiento'] != null && jsonData['fecha_fallecimiento'].toString().isNotEmpty) {
        setParts.add('fecha_fallecimiento = \$${paramIndex}');
        parameters.add(DateTime.parse(jsonData['fecha_fallecimiento'].toString()));
      } else {
        setParts.add('fecha_fallecimiento = NULL');
      }
      paramIndex++;
    }

    if (jsonData.containsKey('lugar_fallecimiento')) {
      if (jsonData['lugar_fallecimiento'] != null && jsonData['lugar_fallecimiento'].toString().trim().isNotEmpty) {
        setParts.add('lugar_fallecimiento = \$${paramIndex}');
        parameters.add(jsonData['lugar_fallecimiento'].toString().trim());
      } else {
        setParts.add('lugar_fallecimiento = NULL');
      }
      paramIndex++;
    }

    if (setParts.isEmpty) {
      return Response.badRequest(
        body: jsonEncode({'error': 'No hay campos para actualizar'}),
      );
    }

    String query = 'UPDATE personajes SET ${setParts.join(', ')} WHERE id = \$${paramIndex} RETURNING id;';
    parameters.add(int.tryParse(id) ?? 0);

    final resultados = await conexion.query(
      query,
      substitutionValues: {
        for (int i = 0; i < parameters.length; i++) '${i + 1}': parameters[i],
      },
    );

    if (resultados.isNotEmpty) {
      return Response.ok(
        jsonEncode({'message': 'Personaje actualizado exitosamente'}),
        headers: {'Content-Type': 'application/json; charset=utf-8'},
      );
    } else {
      return Response.notFound(
        jsonEncode({'error': 'Personaje no encontrado'}),
      );
    }
  } catch (e, stack) {
    print('❌ Error al actualizar personaje: $e\nStack: $stack');
    return Response.internalServerError(
      body: jsonEncode({'error': 'Error al actualizar personaje: $e'}),
    );
  }
}

Future<Response> _eliminarPersonaje(Request req, String id) async {
  try {
    final resultados = await conexion.query(
      'DELETE FROM personajes WHERE id = \$1 RETURNING id;',
      substitutionValues: {'1': int.tryParse(id) ?? 0},
    );

    if (resultados.isNotEmpty) {
      return Response.ok(
        jsonEncode({'message': 'Personaje eliminado exitosamente'}),
        headers: {'Content-Type': 'application/json; charset=utf-8'},
      );
    } else {
      return Response.notFound(
        jsonEncode({'error': 'Personaje no encontrado'}),
      );
    }
  } catch (e, stack) {
    print('❌ Error al eliminar personaje: $e\nStack: $stack');
    return Response.internalServerError(
      body: jsonEncode({'error': 'Error al eliminar personaje: $e'}),
    );
  }
}

Future<Response> _buscarPersonajes(Request req) async {
  try {
    // Obtener parámetros de búsqueda
    final queryParams = req.url.queryParameters;

    String whereClause = '';
    List<dynamic> parameters = [];
    int paramIndex = 1;

    if (queryParams['nombre'] != null && queryParams['nombre']!.isNotEmpty) {
      whereClause += whereClause.isEmpty ? 'WHERE ' : ' AND ';
      whereClause += 'LOWER(nombre) LIKE LOWER(\$${paramIndex})';
      parameters.add('%${queryParams['nombre']}%');
      paramIndex++;
    }

    if (queryParams['lugar_nacimiento'] != null &&
        queryParams['lugar_nacimiento']!.isNotEmpty) {
      whereClause += whereClause.isEmpty ? 'WHERE ' : ' AND ';
      whereClause += 'LOWER(lugar_nacimiento) LIKE LOWER(\$${paramIndex})';
      parameters.add('%${queryParams['lugar_nacimiento']}%');
      paramIndex++;
    }

    if (queryParams['lugar_fallecimiento'] != null &&
        queryParams['lugar_fallecimiento']!.isNotEmpty) {
      whereClause += whereClause.isEmpty ? 'WHERE ' : ' AND ';
      whereClause += 'LOWER(lugar_fallecimiento) LIKE LOWER(\$${paramIndex})';
      parameters.add('%${queryParams['lugar_fallecimiento']}%');
      paramIndex++;
    }

    if (queryParams['fecha_nacimiento_desde'] != null) {
      whereClause += whereClause.isEmpty ? 'WHERE ' : ' AND ';
      whereClause += 'fecha_nacimiento >= \$${paramIndex}';
      parameters.add(queryParams['fecha_nacimiento_desde']);
      paramIndex++;
    }

    if (queryParams['fecha_nacimiento_hasta'] != null) {
      whereClause += whereClause.isEmpty ? 'WHERE ' : ' AND ';
      whereClause += 'fecha_nacimiento <= \$${paramIndex}';
      parameters.add(queryParams['fecha_nacimiento_hasta']);
      paramIndex++;
    }

    if (queryParams['fecha_fallecimiento_desde'] != null) {
      whereClause += whereClause.isEmpty ? 'WHERE ' : ' AND ';
      whereClause += 'fecha_fallecimiento >= \$${paramIndex}';
      parameters.add(queryParams['fecha_fallecimiento_desde']);
      paramIndex++;
    }

    if (queryParams['fecha_fallecimiento_hasta'] != null) {
      whereClause += whereClause.isEmpty ? 'WHERE ' : ' AND ';
      whereClause += 'fecha_fallecimiento <= \$${paramIndex}';
      parameters.add(queryParams['fecha_fallecimiento_hasta']);
      paramIndex++;
    }

    if (queryParams['esta_vivo'] != null) {
      bool estaVivo = queryParams['esta_vivo'] == 'true';
      whereClause += whereClause.isEmpty ? 'WHERE ' : ' AND ';
      if (estaVivo) {
        whereClause += 'fecha_fallecimiento IS NULL';
      } else {
        //whereClause += 'fecha_fallecimiento IS NOT NULL';
      }
    }

    String query =
        'SELECT id, nombre, fecha_nacimiento, lugar_nacimiento, '
        'fecha_fallecimiento, lugar_fallecimiento FROM personajes $whereClause;';

    // En v2.x, se usa .query()
    final resultados = await conexion.query(
      query,
      substitutionValues: {
        for (int i = 0; i < parameters.length; i++) '${i + 1}': parameters[i],
      },
    );

    final lista = resultados.map((fila) {
      // En v2.x, los valores se acceden por índice: fila[0], fila[1], etc.
      DateTime? parseDate(dynamic val) => val is DateTime ? val : null;

      return {
        'id': fila[0],
        'nombre': fila[1],
        'fecha_nacimiento': _formatDate(parseDate(fila[2])),
        'lugar_nacimiento': fila[3],
        'fecha_fallecimiento': _formatDate(parseDate(fila[4])),
        'lugar_fallecimiento': fila[5],
      };
    }).toList();

    return Response.ok(
      jsonEncode(lista),
      headers: {'Content-Type': 'application/json; charset=utf-8'},
    );
  } catch (e, stack) {
    print('❌ Error en búsqueda: $e\nStack: $stack');
    return Response.internalServerError(body: 'Error al buscar personajes');
  }
}
