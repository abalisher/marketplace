// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_chat_stream_done.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantChatStreamDone _$StoreAssistantChatStreamDoneFromJson(
  Map<String, dynamic> json,
) => StoreAssistantChatStreamDone(
  reply: json['reply'] as String,
  messages: (json['messages'] as List<dynamic>)
      .map((e) => StoreAssistantMessage.fromJson(e as Map<String, dynamic>))
      .toList(),
  aborted: json['aborted'] as bool,
  cartId: json['cart_id'] as String?,
  orderId: json['order_id'] as String?,
  attachments: (json['attachments'] as List<dynamic>?)
      ?.map((e) => StoreAssistantAttachment.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$StoreAssistantChatStreamDoneToJson(
  StoreAssistantChatStreamDone instance,
) => <String, dynamic>{
  'reply': instance.reply,
  'messages': instance.messages,
  'cart_id': ?instance.cartId,
  'order_id': ?instance.orderId,
  'attachments': ?instance.attachments,
  'aborted': instance.aborted,
};
