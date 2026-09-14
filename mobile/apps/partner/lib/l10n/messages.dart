/// Контракт строк приложения персонала. Реализуется по одной локали на класс
/// ([MessagesRu], [MessagesKk]). Лёгкий словарь вместо `flutter gen-l10n`/ARB —
/// та же идиома, что в buyer (DECISIONS 2026-07-21).
abstract interface class Messages {
  // ---------- Общее ----------

  /// Название приложения (заголовок окна/задачи).
  String get appTitle;

  /// Подпись кнопки повтора загрузки.
  String get retry;

  /// Подпись кнопки отмены в диалоге.
  String get cancel;

  /// Подпись кнопки сохранения в диалоге.
  String get save;

  /// Пункт меню «выйти из учётки».
  String get signOut;

  // ---------- Вход ----------

  /// Заголовок экрана входа.
  String get signInTitle;

  /// Пояснение под заголовком: чья это учётка.
  String get signInSubtitle;

  /// Метка поля email.
  String get emailLabel;

  /// Метка поля пароля.
  String get passwordLabel;

  /// Подпись кнопки входа.
  String get signInButton;

  /// Ошибка валидации: пустой email.
  String get emailRequired;

  /// Ошибка валидации: email не похож на email.
  String get emailInvalid;

  /// Ошибка валидации: пустой пароль.
  String get passwordRequired;

  /// Ошибка входа: неверные email/пароль.
  String get errorInvalidCredentials;

  /// Ошибка входа/действия: нет связи с сервером.
  String get errorNetwork;

  /// Непредвиденная ошибка.
  String get errorUnknown;

  // ---------- Очередь заданий ----------

  /// Заголовок экрана очереди.
  String get tasksTitle;

  /// Чип «в работе» — ожидает + собираю + нехватка (главный вид очереди).
  String get filterActive;

  /// Статус задания: ожидает сборщика.
  String get statusPending;

  /// Статус задания: собирается.
  String get statusPicking;

  /// Статус задания: собрано.
  String get statusAssembled;

  /// Статус задания: закрыто с нехваткой.
  String get statusShortage;

  /// Пустая очередь.
  String get tasksEmpty;

  /// Ошибка загрузки очереди.
  String get tasksLoadError;

  /// Учётка сборщика заведена без категории — заданий не будет.
  String get groupMissing;

  /// Номер заказа строкой («Заказ №43»); null — номер ещё не присвоен.
  String orderNumber(int? displayId);

  /// Прогресс по позициям задания («Отмечено 2 из 5»).
  String itemsProgress(int marked, int total);

  /// Сколько позиций не набралось целиком («Нехватка: 1»).
  String shortageCount(int count);

  // ---------- Задание ----------

  /// Заголовок экрана задания.
  String get taskTitle;

  /// Ошибка загрузки задания.
  String get taskLoadError;

  /// Кнопка «взять задание в работу».
  String get startTask;

  /// Кнопка возврата к сборке после нехватки (позицию довезли).
  String get resumeTask;

  /// Кнопка закрытия задания.
  String get completeTask;

  /// Почему кнопка закрытия неактивна.
  String get completeBlockedHint;

  /// Почему отметки недоступны: задание ещё не взято в работу.
  String get markBlockedHint;

  /// Сколько нужно набрать по позиции («Нужно: 5»).
  String requiredQuantity(int quantity);

  /// Артикул позиции.
  String sku(String value);

  /// Кнопка отметки «набрано целиком».
  String get markPicked;

  /// Кнопка отметки «набрано частично».
  String get markPartial;

  /// Кнопка отметки «нет в наличии».
  String get markMissing;

  /// Отметка позиции: набрано целиком.
  String get itemPicked;

  /// Отметка позиции: набрано частично («Набрано 3 из 5»).
  String itemPartial(int picked, int quantity);

  /// Отметка позиции: нет в наличии.
  String get itemMissing;

  /// Позиция ещё не отмечена.
  String get itemPending;

  /// Заголовок диалога ввода частичного количества.
  String get partialTitle;

  /// Метка поля количества в этом диалоге.
  String get quantityLabel;

  /// Подсказка допустимого диапазона в диалоге («От 1 до 4»).
  String partialRange(int max);

  /// Тост после закрытия задания без нехватки.
  String get taskDoneAssembled;

  /// Тост после закрытия задания с нехваткой.
  String get taskDoneShortage;

  /// Что стало с заказом: все задания закрыты, заказ ушёл в отгрузку.
  String get orderFinished;

  /// Что стало с заказом: остались задания у других категорий.
  String orderRemaining(int remaining);

  // ---------- Работа без сети ----------

  /// Отметка не ушла на сервер и сохранена на телефоне.
  String get markQueuedOffline;

  /// Сколько отметок ждут сети («2 отметки ждут сети»).
  String pendingMarks(int count);

  /// Кнопка ручной отправки накопленных отметок.
  String get sendPending;

  /// Закрыть задание без сети нельзя.
  String get completeOfflineBlocked;

  /// Действие не удалось (не сеть — ответ сервера).
  String get actionFailed;
}
