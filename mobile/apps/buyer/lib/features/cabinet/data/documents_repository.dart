import '../domain/buyer_document.dart';

/// Источник документов покупателя для кабинета. Абстракция нужна тестам и
/// скриншот-прогонам: экран не знает про транспорт.
abstract interface class DocumentsRepository {
  /// Все документы покупателя одним списком, новые сверху.
  Future<List<BuyerDocument>> fetchDocuments();
}
