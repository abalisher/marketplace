/// Разделы кабинета клиента (T10.6). Один список на приложение: по нему рисуются
/// и ссылки в рельсе истории, и ряд-переключатель над содержимым — расхождение
/// между ними было бы заметно сразу. Порядок тот же, что на витрине.
enum CabinetSection {
  orders('/cabinet/orders'),
  cart('/cabinet/cart'),
  documents('/cabinet/documents'),
  profile('/cabinet/profile');

  const CabinetSection(this.route);

  /// Маршрут раздела в роутере приложения.
  final String route;
}
