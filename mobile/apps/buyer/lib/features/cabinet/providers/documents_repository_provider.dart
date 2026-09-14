import 'package:core/config/app_config_provider.dart';
import 'package:core/network/medusa_api_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/documents_repository.dart';
import '../data/medusa_documents_repository.dart';

/// Провайдер репозитория документов кабинета. По умолчанию — реализация поверх
/// Medusa; в тестах переопределяется фейком.
final documentsRepositoryProvider = Provider<DocumentsRepository>((ref) {
  final api = ref.watch(medusaApiProvider);
  final config = ref.watch(appConfigProvider);
  return MedusaDocumentsRepository(api, config.publishableKey);
});
