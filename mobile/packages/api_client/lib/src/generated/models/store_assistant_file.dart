// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_assistant_file.g.dart';

@JsonSerializable()
class StoreAssistantFile {
  const StoreAssistantFile({
    required this.mimeType,
    required this.data,
    this.name,
  });

  factory StoreAssistantFile.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantFileFromJson(json);

  /// Тип файла как его отдала система выбора файла (параметры и регистр допустимы).
  @JsonKey(name: 'mime_type')
  final String mimeType;

  /// Содержимое файла в base64 (допустим префикс data-URL). Не больше 8 МБ.
  final String data;

  /// Имя файла — только для показа в ленте («смета.pdf»); модели не уходит.
  final String? name;

  Map<String, Object?> toJson() => _$StoreAssistantFileToJson(this);
}
