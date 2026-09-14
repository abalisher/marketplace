import 'package:api_client/api_client.dart'
    show MedusaStoreApi, StoreMyDocument;

import '../domain/buyer_document.dart';
import 'documents_repository.dart';

/// Реализация [DocumentsRepository] поверх нашего `/store/documents` (T10.6a):
/// все документы покупателя одним запросом, текущих версий, новые сверху.
/// Порядок задаёт бэкенд — клиент не пересортировывает.
class MedusaDocumentsRepository implements DocumentsRepository {
  MedusaDocumentsRepository(this._api, this._publishableKey);

  final MedusaStoreApi _api;
  final String _publishableKey;

  @override
  Future<List<BuyerDocument>> fetchDocuments() async {
    final response = await _api.documents.storeListMyDocuments(
      xPublishableApiKey: _publishableKey,
    );
    return response.documents.map(_toDocument).toList();
  }

  BuyerDocument _toDocument(StoreMyDocument doc) {
    final displayId = doc.order.displayId;
    return BuyerDocument(
      id: doc.id,
      type: doc.type.json ?? doc.type.name,
      number: doc.number,
      orderId: doc.order.id,
      orderDisplayNumber: displayId == null ? null : '#$displayId',
      total: doc.totalMoney,
      currencyCode: doc.currencyCode,
      createdAt: doc.createdAt,
      fileUrl: doc.fileUrl,
    );
  }
}
