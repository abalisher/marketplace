import 'package:core/network/dio_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/assistant_repository.dart';
import '../data/medusa_assistant_repository.dart';

/// Провайдер репозитория ассистента. По умолчанию — реализация поверх Medusa
/// (настроенный Dio из `core`: базовый URL + publishable-ключ + auth); в тестах
/// переопределяется фейком.
final assistantRepositoryProvider = Provider<AssistantRepository>((ref) {
  final dio = ref.watch(dioProvider);
  return MedusaAssistantRepository(dio);
});
