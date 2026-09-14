// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_auth_prompt.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantAuthPrompt _$StoreAssistantAuthPromptFromJson(
  Map<String, dynamic> json,
) => StoreAssistantAuthPrompt(
  type: StoreAssistantAuthPromptType.fromJson(json['type'] as String),
  reason: StoreAssistantAuthPromptReason.fromJson(json['reason'] as String),
);

Map<String, dynamic> _$StoreAssistantAuthPromptToJson(
  StoreAssistantAuthPrompt instance,
) => <String, dynamic>{
  'type': _$StoreAssistantAuthPromptTypeEnumMap[instance.type]!,
  'reason': _$StoreAssistantAuthPromptReasonEnumMap[instance.reason]!,
};

const _$StoreAssistantAuthPromptTypeEnumMap = {
  StoreAssistantAuthPromptType.authPrompt: 'auth_prompt',
  StoreAssistantAuthPromptType.$unknown: r'$unknown',
};

const _$StoreAssistantAuthPromptReasonEnumMap = {
  StoreAssistantAuthPromptReason.checkout: 'checkout',
  StoreAssistantAuthPromptReason.$unknown: r'$unknown',
};
