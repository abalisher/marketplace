// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_cart_line.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantCartLine _$StoreAssistantCartLineFromJson(
  Map<String, dynamic> json,
) => StoreAssistantCartLine(
  variantId: json['variant_id'] as String,
  title: json['title'] as String,
  quantity: json['quantity'] as num,
  unitPrice: json['unit_price'] as num,
  total: json['total'] as num,
);

Map<String, dynamic> _$StoreAssistantCartLineToJson(
  StoreAssistantCartLine instance,
) => <String, dynamic>{
  'variant_id': instance.variantId,
  'title': instance.title,
  'quantity': instance.quantity,
  'unit_price': instance.unitPrice,
  'total': instance.total,
};
