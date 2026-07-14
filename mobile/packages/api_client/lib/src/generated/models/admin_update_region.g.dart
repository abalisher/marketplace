// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_region.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateRegion _$AdminUpdateRegionFromJson(Map<String, dynamic> json) =>
    AdminUpdateRegion(
      name: json['name'] as String?,
      currencyCode: json['currency_code'] as String?,
      countries: (json['countries'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      automaticTaxes: json['automatic_taxes'] as bool?,
      paymentProviders: (json['payment_providers'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      metadata: json['metadata'],
      isTaxInclusive: json['is_tax_inclusive'] as bool?,
    );

Map<String, dynamic> _$AdminUpdateRegionToJson(AdminUpdateRegion instance) =>
    <String, dynamic>{
      'name': instance.name,
      'currency_code': instance.currencyCode,
      'countries': instance.countries,
      'automatic_taxes': instance.automaticTaxes,
      'payment_providers': instance.paymentProviders,
      'metadata': instance.metadata,
      'is_tax_inclusive': instance.isTaxInclusive,
    };
