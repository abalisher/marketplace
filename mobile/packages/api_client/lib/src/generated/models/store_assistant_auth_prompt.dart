// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_assistant_auth_prompt_reason.dart';
import 'store_assistant_auth_prompt_type.dart';

part 'store_assistant_auth_prompt.g.dart';

/// Просьба войти по номеру телефона: оформление заказа доступно только авторизованному покупателю (T10.8). Клиент рисует карточку с кнопкой входа; после входа покупатель возвращается в тот же диалог, а корзина, собранная гостем, переносится на него.
@JsonSerializable()
class StoreAssistantAuthPrompt {
  const StoreAssistantAuthPrompt({required this.type, required this.reason});

  factory StoreAssistantAuthPrompt.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantAuthPromptFromJson(json);

  final StoreAssistantAuthPromptType type;

  /// Зачем нужен вход. checkout — оформление заказа.
  final StoreAssistantAuthPromptReason reason;

  Map<String, Object?> toJson() => _$StoreAssistantAuthPromptToJson(this);
}
