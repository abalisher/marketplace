import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/buyer_document.dart';
import 'documents_repository_provider.dart';

/// Все документы текущего покупателя (раздел «Документы» кабинета).
final myDocumentsProvider = FutureProvider<List<BuyerDocument>>((ref) {
  return ref.watch(documentsRepositoryProvider).fetchDocuments();
});
