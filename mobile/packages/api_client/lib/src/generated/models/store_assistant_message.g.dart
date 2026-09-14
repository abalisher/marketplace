// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_message.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantMessage _$StoreAssistantMessageFromJson(
  Map<String, dynamic> json,
) => StoreAssistantMessage(
  role: StoreAssistantMessageRole.fromJson(json['role'] as String),
  content: json['content'] as String,
);

Map<String, dynamic> _$StoreAssistantMessageToJson(
  StoreAssistantMessage instance,
) => <String, dynamic>{
  'role': _$StoreAssistantMessageRoleEnumMap[instance.role]!,
  'content': instance.content,
};

const _$StoreAssistantMessageRoleEnumMap = {
  StoreAssistantMessageRole.user: 'user',
  StoreAssistantMessageRole.assistant: 'assistant',
  StoreAssistantMessageRole.$unknown: r'$unknown',
};
