/// Задание нельзя закрыть, пока часть отметок лежит в очереди и не уехала на
/// сервер: итог задания («собрано» / «нехватка») выводит бэкенд из отметок, и
/// закрытие без них дало бы неправильный итог.
///
/// Бросается контроллером задания и превращается экраном в понятную фразу:
/// «сначала отправьте отметки».
class MarksNotSentException implements Exception {
  const MarksNotSentException(this.pending);

  /// Сколько отметок этого задания ещё ждут сети.
  final int pending;

  @override
  String toString() => 'MarksNotSentException($pending)';
}
