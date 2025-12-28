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

  final router = Router()..get('/personajes', _obtenerPersonajes);

  final handler = const Pipeline()
      .addMiddleware(logRequests())
      .addMiddleware(corsHeaders())
      .addHandler(router);

  final server = await io.serve(handler, '0.0.0.0', 8080);
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
