// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_assistant_message_role.dart';

part 'store_assistant_message.g.dart';

@JsonSerializable()
class StoreAssistantMessage {
  const StoreAssistantMessage({required this.role, required this.content});

  factory StoreAssistantMessage.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantMessageFromJson(json);

  final StoreAssistantMessageRole role;

  /// Текст реплики. Пустым может быть только реплика ПОКУПАТЕЛЯ: у последней — если к ней приложены files (снимок без подписи — нормальное сообщение), у прошлых — если таким снимком был тот ход (файл к ним уже не прикладывается, вложение живёт ровно один ход). Ответ ассистента пустым не бывает.
  final String content;

  Map<String, Object?> toJson() => _$StoreAssistantMessageToJson(this);
}
