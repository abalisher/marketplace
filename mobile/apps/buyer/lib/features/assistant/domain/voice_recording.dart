import 'dart:typed_data';

/// Готовая запись голосового сообщения (T10.3) в том виде, в каком её принимает
/// `POST /store/assistant/transcribe`: контейнер + байты + длительность.
///
/// Длительность считает клиент: у бэкенда нет декодера, и предел 60 секунд он
/// проверяет по присланному числу (решение T10.2).
class VoiceRecording {
  const VoiceRecording({
    required this.mimeType,
    required this.bytes,
    required this.duration,
  });

  final String mimeType;
  final Uint8List bytes;
  final Duration duration;
}
