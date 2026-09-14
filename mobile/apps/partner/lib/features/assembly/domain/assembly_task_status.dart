/// Статус задания сборки (стейт-машина живёт на бэкенде, клиент только
/// отображает): ожидает → собирается → собрано | нехватка. Из нехватки можно
/// вернуться в работу — позицию довезли.
enum AssemblyTaskStatus {
  pending,
  picking,
  assembled,
  shortage;

  /// Разбор значения из контракта; незнакомое значение — [pending]
  /// (новый статус на сервере не должен ронять экран сборщика).
  static AssemblyTaskStatus parse(String? raw) {
    return AssemblyTaskStatus.values.firstWhere(
      (status) => status.name == raw,
      orElse: () => AssemblyTaskStatus.pending,
    );
  }

  /// Задание закрыто (сборщик по нему отработал).
  bool get isClosed =>
      this == AssemblyTaskStatus.assembled ||
      this == AssemblyTaskStatus.shortage;

  /// По заданию можно отмечать позиции — только когда оно в работе.
  bool get acceptsMarks => this == AssemblyTaskStatus.picking;
}
