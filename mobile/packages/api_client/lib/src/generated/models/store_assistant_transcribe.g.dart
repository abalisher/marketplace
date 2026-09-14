// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_transcribe.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantTranscribe _$StoreAssistantTranscribeFromJson(
  Map<String, dynamic> json,
) => StoreAssistantTranscribe(
  mimeType: json['mime_type'] as String,
  data: json['data'] as String,
  durationMs: (json['duration_ms'] as num?)?.toInt(),
);

Map<String, dynamic> _$StoreAssistantTranscribeToJson(
  StoreAssistantTranscribe instance,
) => <String, dynamic>{
  'mime_type': instance.mimeType,
  'data': instance.data,
  'duration_ms': ?instance.durationMs,
};
