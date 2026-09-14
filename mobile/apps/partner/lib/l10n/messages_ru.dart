import 'messages.dart';

/// Русская локаль (основная).
class MessagesRu implements Messages {
  const MessagesRu();

  @override
  String get appTitle => 'СтройМаркет · Сборка';

  @override
  String get retry => 'Повторить';

  @override
  String get cancel => 'Отмена';

  @override
  String get save => 'Сохранить';

  @override
  String get signOut => 'Выйти';

  @override
  String get signInTitle => 'Вход сотрудника';

  @override
  String get signInSubtitle =>
      'Рабочая учётка склада. Задания приходят по вашей категории.';

  @override
  String get emailLabel => 'Email';

  @override
  String get passwordLabel => 'Пароль';

  @override
  String get signInButton => 'Войти';

  @override
  String get emailRequired => 'Введите email';

  @override
  String get emailInvalid => 'Это не похоже на email';

  @override
  String get passwordRequired => 'Введите пароль';

  @override
  String get errorInvalidCredentials => 'Неверный email или пароль';

  @override
  String get errorNetwork => 'Нет связи с сервером. Проверьте сеть';

  @override
  String get errorUnknown => 'Что-то пошло не так, попробуйте ещё раз';

  @override
  String get tasksTitle => 'Мои задания';

  @override
  String get filterActive => 'В работе';

  @override
  String get statusPending => 'Ожидает';

  @override
  String get statusPicking => 'Собираю';

  @override
  String get statusAssembled => 'Собрано';

  @override
  String get statusShortage => 'Нехватка';

  @override
  String get tasksEmpty => 'Заданий нет';

  @override
  String get tasksLoadError => 'Не удалось загрузить задания';

  @override
  String get groupMissing =>
      'Учётке не назначена категория — заданий не будет. Скажите управляющему.';

  @override
  String orderNumber(int? displayId) =>
      displayId == null ? 'Заказ' : 'Заказ №$displayId';

  @override
  String itemsProgress(int marked, int total) => 'Отмечено $marked из $total';

  @override
  String shortageCount(int count) => 'Нехватка: $count';

  @override
  String get taskTitle => 'Задание';

  @override
  String get taskLoadError => 'Не удалось загрузить задание';

  @override
  String get startTask => 'Взять в работу';

  @override
  String get resumeTask => 'Вернуться к сборке';

  @override
  String get completeTask => 'Собрано';

  @override
  String get completeBlockedHint => 'Отметьте каждую позицию';

  @override
  String get markBlockedHint => 'Возьмите задание в работу — тогда отмечайте';

  @override
  String requiredQuantity(int quantity) => 'Нужно: $quantity';

  @override
  String sku(String value) => 'Артикул $value';

  @override
  String get markPicked => 'Набрал';

  @override
  String get markPartial => 'Частично';

  @override
  String get markMissing => 'Нет';

  @override
  String get itemPicked => 'Набрано полностью';

  @override
  String itemPartial(int picked, int quantity) =>
      'Набрано $picked из $quantity';

  @override
  String get itemMissing => 'Нет в наличии';

  @override
  String get itemPending => 'Не отмечено';

  @override
  String get partialTitle => 'Сколько набрали?';

  @override
  String get quantityLabel => 'Количество';

  @override
  String partialRange(int max) => 'От 1 до $max';

  @override
  String get taskDoneAssembled => 'Задание собрано';

  @override
  String get taskDoneShortage => 'Задание закрыто с нехваткой';

  @override
  String get orderFinished => 'По заказу отработали все категории';

  @override
  String orderRemaining(int remaining) =>
      'По заказу осталось категорий: $remaining';

  @override
  String get markQueuedOffline => 'Нет сети — отметка сохранена, уйдёт сама';

  @override
  String pendingMarks(int count) => 'Отметок ждут сети: $count';

  @override
  String get sendPending => 'Отправить';

  @override
  String get completeOfflineBlocked =>
      'Без сети задание не закрыть — сначала отправьте отметки';

  @override
  String get actionFailed => 'Не удалось выполнить, попробуйте ещё раз';
}
