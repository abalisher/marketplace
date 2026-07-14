// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_store.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateStore _$AdminUpdateStoreFromJson(
  Map<String, dynamic> json,
) => AdminUpdateStore(
  name: json['name'] as String?,
  supportedCurrencies: (json['supported_currencies'] as List<dynamic>?)
      ?.map(
        (e) => AdminUpdateStoreSupportedCurrency.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
  defaultSalesChannelId: json['default_sales_channel_id'] as String?,
  defaultRegionId: json['default_region_id'] as String?,
  defaultLocationId: json['default_location_id'] as String?,
  metadata: json['metadata'],
  supportedLocales: (json['supported_locales'] as List<dynamic>?)
      ?.map(
        (e) =>
            AdminUpdateStoreSupportedLocale.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
);

Map<String, dynamic> _$AdminUpdateStoreToJson(AdminUpdateStore instance) =>
    <String, dynamic>{
      'name': instance.name,
      'supported_currencies': instance.supportedCurrencies,
      'default_sales_channel_id': instance.defaultSalesChannelId,
      'default_region_id': instance.defaultRegionId,
      'default_location_id': instance.defaultLocationId,
      'metadata': instance.metadata,
      'supported_locales': instance.supportedLocales,
    };
