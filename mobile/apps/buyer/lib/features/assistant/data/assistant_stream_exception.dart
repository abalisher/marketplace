/// Потоковый ход недоступен: бэкенд без стриминга, роут закрыт, соединение не
/// открылось. Контроллер на это исключение повторяет тот же ход обычным POST
/// (откат из T10.1d).
///
/// ВАЖНО: исключение уместно только ДО первого события потока. Если поток уже
/// открылся, повтор запрещён — инструменты хода могли сработать, и обычный POST
/// продублировал бы их (вторая корзина, второй заказ).
class AssistantStreamUnavailableException implements Exception {
  const AssistantStreamUnavailableException(this.message);

  final String message;

  @override
  String toString() => 'AssistantStreamUnavailableException: $message';
}
