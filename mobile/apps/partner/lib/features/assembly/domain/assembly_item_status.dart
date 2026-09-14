/// Отметка сборщика по позиции задания: не отмечена → набрана целиком /
/// набрана частично / нет в наличии. Обратно в [pending] позиция не
/// возвращается (правило бэкенда).
enum AssemblyItemStatus {
  pending,
  picked,
  partial,
  missing;

  /// Разбор значения из контракта; незнакомое — [pending].
  static AssemblyItemStatus parse(String? raw) {
    return AssemblyItemStatus.values.firstWhere(
      (status) => status.name == raw,
      orElse: () => AssemblyItemStatus.pending,
    );
  }

  /// Позиция отмечена (по ней приняли решение).
  bool get isMarked => this != AssemblyItemStatus.pending;

  /// Позиция набралась не полностью — это и есть нехватка для отгрузки.
  bool get isShortage =>
      this == AssemblyItemStatus.partial || this == AssemblyItemStatus.missing;
}
