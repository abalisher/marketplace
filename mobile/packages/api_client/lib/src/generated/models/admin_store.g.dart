// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_store.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminStore _$AdminStoreFromJson(Map<String, dynamic> json) => AdminStore(
  id: json['id'] as String,
  name: json['name'] as String,
  supportedCurrencies: (json['supported_currencies'] as List<dynamic>)
      .map((e) => AdminStoreCurrency.fromJson(e as Map<String, dynamic>))
      .toList(),
  defaultSalesChannelId: json['default_sales_channel_id'] as String,
  defaultRegionId: json['default_region_id'] as String,
  defaultLocationId: json['default_location_id'] as String,
  metadata: json['metadata'],
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  supportedLocales: (json['supported_locales'] as List<dynamic>)
      .map((e) => AdminStoreLocale.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminStoreToJson(AdminStore instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'supported_currencies': instance.supportedCurrencies,
      'default_sales_channel_id': instance.defaultSalesChannelId,
      'default_region_id': instance.defaultRegionId,
      'default_location_id': instance.defaultLocationId,
      'metadata': instance.metadata,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'supported_locales': instance.supportedLocales,
    };
