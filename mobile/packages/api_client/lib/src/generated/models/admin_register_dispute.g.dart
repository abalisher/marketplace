// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_register_dispute.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminRegisterDispute _$AdminRegisterDisputeFromJson(
  Map<String, dynamic> json,
) => AdminRegisterDispute(
  orderId: json['order_id'] as String,
  category: AdminRegisterDisputeCategory.fromJson(json['category'] as String),
  description: json['description'] as String?,
);

Map<String, dynamic> _$AdminRegisterDisputeToJson(
  AdminRegisterDispute instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'category': _$AdminRegisterDisputeCategoryEnumMap[instance.category]!,
  'description': ?instance.description,
};

const _$AdminRegisterDisputeCategoryEnumMap = {
  AdminRegisterDisputeCategory.notDelivered: 'not_delivered',
  AdminRegisterDisputeCategory.damaged: 'damaged',
  AdminRegisterDisputeCategory.wrongItem: 'wrong_item',
  AdminRegisterDisputeCategory.quality: 'quality',
  AdminRegisterDisputeCategory.other: 'other',
  AdminRegisterDisputeCategory.$unknown: r'$unknown',
};
