/// Результат запроса кода входа на номер телефона: канон номера (его показываем
/// на шаге ввода кода), срок жизни кода и пауза перед повторной отправкой.
///
/// [devCode] — код открытым текстом: SMS-провайдера на MVP нет, и на стенде
/// бэкенд отдаёт код в ответе (dev-канал). В проде поле пустое.
class PhoneCodeRequest {
  const PhoneCodeRequest({
    required this.phone,
    required this.expiresIn,
    required this.resendAfter,
    this.devCode,
  });

  /// Номер в каноне +7XXXXXXXXXX.
  final String phone;

  /// Сколько секунд живёт код.
  final int expiresIn;

  /// Через сколько секунд можно запросить код заново.
  final int resendAfter;

  /// Код из dev-канала стенда (в проде null).
  final String? devCode;
}
