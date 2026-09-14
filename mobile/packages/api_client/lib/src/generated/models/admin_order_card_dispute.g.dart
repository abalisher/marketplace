// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_card_dispute.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderCardDispute _$AdminOrderCardDisputeFromJson(
  Map<String, dynamic> json,
) => AdminOrderCardDispute(
  id: json['id'] as String,
  category: json['category'] as String,
  status: json['status'] as String,
  description: json['description'] as String?,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$AdminOrderCardDisputeToJson(
  AdminOrderCardDispute instance,
) => <String, dynamic>{
  'id': instance.id,
  'category': instance.category,
  'status': instance.status,
  'description': ?instance.description,
  'created_at': ?instance.createdAt?.toIso8601String(),
};
