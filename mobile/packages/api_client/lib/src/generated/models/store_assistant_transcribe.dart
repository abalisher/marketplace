// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_assistant_transcribe.g.dart';

@JsonSerializable()
class StoreAssistantTranscribe {
  const StoreAssistantTranscribe({
    required this.mimeType,
    required this.data,
    this.durationMs,
  });

  factory StoreAssistantTranscribe.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantTranscribeFromJson(json);

  /// Тип записи как его отдал рекордер, параметры допустимы: audio/webm;codecs=opus (Chrome), audio/ogg (Firefox), audio/x-m4a или audio/mp4 (Android/iOS), audio/aac, audio/wav. Другой контейнер — 400.
  @JsonKey(name: 'mime_type')
  final String mimeType;

  /// Содержимое записи в base64 (допустим префикс data-URL от FileReader.readAsDataURL). Не больше 8 МБ после декодирования.
  final String data;

  /// Длительность записи по данным клиента, мс. Необязательна; больше 60000 — 400.
  @JsonKey(name: 'duration_ms')
  final int? durationMs;

  Map<String, Object?> toJson() => _$StoreAssistantTranscribeToJson(this);
}
