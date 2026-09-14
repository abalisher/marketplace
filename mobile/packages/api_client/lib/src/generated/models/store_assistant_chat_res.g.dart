// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_chat_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantChatRes _$StoreAssistantChatResFromJson(
  Map<String, dynamic> json,
) => StoreAssistantChatRes(
  reply: json['reply'] as String,
  messages: (json['messages'] as List<dynamic>)
      .map((e) => StoreAssistantMessage.fromJson(e as Map<String, dynamic>))
      .toList(),
  cartId: json['cart_id'] as String?,
  orderId: json['order_id'] as String?,
  attachments: (json['attachments'] as List<dynamic>?)
      ?.map((e) => StoreAssistantAttachment.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$StoreAssistantChatResToJson(
  StoreAssistantChatRes instance,
) => <String, dynamic>{
  'reply': instance.reply,
  'messages': instance.messages,
  'cart_id': ?instance.cartId,
  'order_id': ?instance.orderId,
  'attachments': ?instance.attachments,
};
