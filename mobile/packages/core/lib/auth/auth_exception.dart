/// Тип ошибки авторизации. Репозиторий переводит ответы бэкенда/сети в один из
/// этих кодов, а экран показывает по нему локализованное сообщение (модель не
/// хранит текст — тексты живут в словарях приложения).
enum AuthErrorKind {
  /// Неверные email/пароль при входе.
  invalidCredentials,

  /// Регистрация на уже занятый email.
  emailAlreadyExists,

  /// Номер не похож на мобильный номер Казахстана.
  invalidPhone,

  /// Код запросили раньше, чем истекла пауза «выслать снова».
  tooManyRequests,

  /// Введён неверный код входа.
  invalidCode,

  /// Срок жизни кода истёк — нужен новый.
  codeExpired,

  /// Исчерпаны попытки ввода кода — код аннулирован.
  tooManyAttempts,

  /// Сеть недоступна / таймаут.
  network,

  /// Прочая непредвиденная ошибка.
  unknown,
}

/// Исключение авторизации с типизированным кодом [kind].
///
/// [retryAfter] заполняется для [AuthErrorKind.tooManyRequests] — столько
/// секунд осталось до разрешённой повторной отправки кода.
class AuthException implements Exception {
  const AuthException(this.kind, {this.retryAfter});

  final AuthErrorKind kind;
  final int? retryAfter;

  @override
  String toString() => 'AuthException($kind)';
}
