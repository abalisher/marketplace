import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/record_voice_recorder.dart';
import '../data/voice_recorder.dart';

/// Провайдер записи голоса (T10.3). По умолчанию — реализация поверх плагина
/// `record`; в тестах переопределяется фейком (микрофона в тестовой среде нет).
/// Плагин отпускаем вместе с провайдером — иначе микрофон остаётся открытым.
final voiceRecorderProvider = Provider<VoiceRecorder>((ref) {
  final recorder = RecordVoiceRecorder();
  ref.onDispose(recorder.dispose);
  return recorder;
});
