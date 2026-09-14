// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_sales_channel.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateSalesChannel _$AdminCreateSalesChannelFromJson(
  Map<String, dynamic> json,
) => AdminCreateSalesChannel(
  name: json['name'] as String,
  description: json['description'] as String?,
  isDisabled: json['is_disabled'] as bool?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminCreateSalesChannelToJson(
  AdminCreateSalesChannel instance,
) => <String, dynamic>{
  'name': instance.name,
  'description': ?instance.description,
  'is_disabled': ?instance.isDisabled,
  'metadata': ?instance.metadata,
};
