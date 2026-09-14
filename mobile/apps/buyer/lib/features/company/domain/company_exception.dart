/// Причина отказа при работе с разделом «Компания». Точную формулировку
/// бэкенда не показываем: она не локализована, а покупателю важно, что делать
/// дальше.
enum CompanyErrorKind {
  /// Заявку не принял бэкенд (4xx): БИН занят, покупатель уже сотрудник другой
  /// компании, данные не прошли проверку.
  rejected,

  /// Сеть недоступна.
  network,

  /// Прочее.
  unknown,
}

/// Ошибка раздела «Компания» с разобранной причиной.
class CompanyException implements Exception {
  const CompanyException(this.kind);

  final CompanyErrorKind kind;

  @override
  String toString() => 'CompanyException($kind)';
}
