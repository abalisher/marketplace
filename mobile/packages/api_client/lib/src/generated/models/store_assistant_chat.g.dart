// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_chat.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantChat _$StoreAssistantChatFromJson(Map<String, dynamic> json) =>
    StoreAssistantChat(
      messages: (json['messages'] as List<dynamic>)
          .map((e) => StoreAssistantMessage.fromJson(e as Map<String, dynamic>))
          .toList(),
      cartId: json['cart_id'] as String?,
      orderId: json['order_id'] as String?,
      files: (json['files'] as List<dynamic>?)
          ?.map((e) => StoreAssistantFile.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$StoreAssistantChatToJson(StoreAssistantChat instance) =>
    <String, dynamic>{
      'messages': instance.messages,
      'cart_id': ?instance.cartId,
      'order_id': ?instance.orderId,
      'files': ?instance.files,
    };
