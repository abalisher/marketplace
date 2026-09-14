import 'dart:convert';

import 'package:dio/dio.dart';

import '../domain/voice_recording.dart';
import '../domain/voice_transcript.dart';
import 'voice_repository.dart';

/// Реализация [VoiceRepository] поверх `POST /store/assistant/transcribe`
/// (T10.2/T10.3). Идёт напрямую через настроенный [Dio] (базовый URL +
/// publishable-ключ + auth уже в нём) — как и остальной ассистент: тело здесь
/// одно поле base64, генерированный клиент ничего к этому не добавляет.
///
/// Аудио никуда не сохраняется: байты живут ровно до конца запроса.
class MedusaVoiceRepository implements VoiceRepository {
  MedusaVoiceRepository(this._dio);

  final Dio _dio;

  @override
  Future<VoiceTranscript> transcribe(VoiceRecording recording) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/store/assistant/transcribe',
      data: {
        'mime_type': recording.mimeType,
        'data': base64Encode(recording.bytes),
        // Длительность считает клиент: у бэкенда нет декодера, и предел 60 с он
        // проверяет по этому числу (решение T10.2).
        'duration_ms': recording.duration.inMilliseconds,
      },
    );
    final body = response.data ?? const <String, dynamic>{};
    return VoiceTranscript(
      // Пустой текст — штатный ответ «не расслышали», а не сбой.
      text: (body['text'] as String?)?.trim() ?? '',
      language: (body['language'] as String?) ?? '',
    );
  }
}
