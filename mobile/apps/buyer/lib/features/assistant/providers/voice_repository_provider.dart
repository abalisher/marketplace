import 'package:core/network/dio_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/medusa_voice_repository.dart';
import '../data/voice_repository.dart';

/// Провайдер распознавания речи (T10.3). По умолчанию — реализация поверх
/// Medusa (настроенный Dio из `core`); в тестах переопределяется фейком.
final voiceRepositoryProvider = Provider<VoiceRepository>((ref) {
  final dio = ref.watch(dioProvider);
  return MedusaVoiceRepository(dio);
});
