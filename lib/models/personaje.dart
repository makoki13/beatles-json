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

  // Constructor from JSON
  factory Personaje.fromJson(Map<String, dynamic> json) {
    return Personaje(
      id: json['id'] as int,
      nombre: json['nombre'] as String,
      fechaNacimiento: json['fecha_nacimiento'] != null 
          ? DateTime.parse(json['fecha_nacimiento'] as String) 
          : null,
      lugarNacimiento: json['lugar_nacimiento'] as String?,
      fechaFallecimiento: json['fecha_fallecimiento'] != null 
          ? DateTime.parse(json['fecha_fallecimiento'] as String) 
          : null,
      lugarFallecimiento: json['lugar_fallecimiento'] as String?,
    );
  }

  // Method to convert to JSON
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
}