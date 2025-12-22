class Personaje {
  final int id;
  final String nombre;
  final DateTime? fechaNacimiento;
  final String? lugarNacimiento;
  final DateTime? fechaFallecimiento;
  final String? lugarFallecimiento;

  Personaje({
    required this.id,
    required this.nombre,
    this.fechaNacimiento,
    this.lugarNacimiento,
    this.fechaFallecimiento,
    this.lugarFallecimiento,
  });

  // Constructor desde JSON
  factory Personaje.fromJson(Map<String, dynamic> json) {
    return Personaje(
      id: json['id'] ?? 0,
      nombre: json['nombre'] ?? '',
      fechaNacimiento: json['fecha_nacimiento'] != null
          ? DateTime.parse(json['fecha_nacimiento'])
          : null,
      lugarNacimiento: json['lugar_nacimiento'],
      fechaFallecimiento: json['fecha_fallecimiento'] != null
          ? DateTime.parse(json['fecha_fallecimiento'])
          : null,
      lugarFallecimiento: json['lugar_fallecimiento'],
    );
  }

  // Método para convertir a JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'fecha_nacimiento': fechaNacimiento?.toIso8601String(),
      'lugar_nacimiento': lugarNacimiento,
      'fecha_fallecimiento': fechaFallecimiento?.toIso8601String(),
      'lugar_fallecimiento': lugarFallecimiento,
    };
  }

  // Constructor para crear un nuevo personaje con valores por defecto
  factory Personaje.nuevo() {
    return Personaje(
      id: 0,
      nombre: '',
      fechaNacimiento: null,
      lugarNacimiento: null,
      fechaFallecimiento: null,
      lugarFallecimiento: null,
    );
  }
}