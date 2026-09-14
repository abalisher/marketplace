// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_assistant_transcript_res.g.dart';

@JsonSerializable()
class StoreAssistantTranscriptRes {
  const StoreAssistantTranscriptRes({
    required this.text,
    required this.language,
  });

  factory StoreAssistantTranscriptRes.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantTranscriptResFromJson(json);

  /// Распознанный текст ровно как сказано, без перевода. Пустая строка — не расслышали.
  final String text;

  /// Основной язык записи кодом BCP-47 без региона (ru, kk, en). null — модель не определила.
  final String? language;

  Map<String, Object?> toJson() => _$StoreAssistantTranscriptResToJson(this);
}
