// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_sales_channel.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminSalesChannel _$AdminSalesChannelFromJson(Map<String, dynamic> json) =>
    AdminSalesChannel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      isDisabled: json['is_disabled'] as bool,
      metadata: json['metadata'],
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      deletedAt: json['deleted_at'] == null
          ? null
          : DateTime.parse(json['deleted_at'] as String),
    );

Map<String, dynamic> _$AdminSalesChannelToJson(AdminSalesChannel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': ?instance.description,
      'is_disabled': instance.isDisabled,
      'metadata': ?instance.metadata,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
    };
