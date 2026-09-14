// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_card_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderCardItem _$AdminOrderCardItemFromJson(Map<String, dynamic> json) =>
    AdminOrderCardItem(
      id: json['id'] as String,
      title: json['title'] as String,
      quantity: json['quantity'] as num,
      variantTitle: json['variant_title'] as String?,
      unitPrice: json['unit_price'] as num?,
      total: json['total'] as num?,
    );

Map<String, dynamic> _$AdminOrderCardItemToJson(AdminOrderCardItem instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'variant_title': ?instance.variantTitle,
      'quantity': instance.quantity,
      'unit_price': ?instance.unitPrice,
      'total': ?instance.total,
    };
