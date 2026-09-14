/// Статус оплаты Kaspi в терминах экрана: ожидание / оплачено / не удалось.
/// Маппится из статуса платёжной сессии Medusa на границе репозитория.
enum KaspiPaymentStatus { pending, authorized, failed }

/// Состояние Kaspi-оплаты: статус + данные QR/ссылки для показа покупателю.
/// Инвойс/сессию считает бэкенд; экран отображает QR и опрашивает статус.
class KaspiPayment {
  const KaspiPayment({required this.status, this.qrPayload, this.paymentUrl});

  final KaspiPaymentStatus status;
  final String? qrPayload;
  final String? paymentUrl;

  bool get isAuthorized => status == KaspiPaymentStatus.authorized;
  bool get isFailed => status == KaspiPaymentStatus.failed;
}
