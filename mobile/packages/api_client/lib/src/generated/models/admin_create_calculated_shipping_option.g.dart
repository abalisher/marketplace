// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_calculated_shipping_option.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateCalculatedShippingOption
_$AdminCreateCalculatedShippingOptionFromJson(Map<String, dynamic> json) =>
    AdminCreateCalculatedShippingOption(
      priceType: AdminCreateCalculatedShippingOptionPriceType.fromJson(
        json['price_type'] as String,
      ),
      name: json['name'] as String,
      serviceZoneId: json['service_zone_id'] as String,
      shippingProfileId: json['shipping_profile_id'] as String,
      providerId: json['provider_id'] as String,
      data: json['data'],
      type: json['type'] == null
          ? null
          : AdminCreateShippingOptionType.fromJson(
              json['type'] as Map<String, dynamic>,
            ),
      typeId: json['type_id'] as String?,
      rules: (json['rules'] as List<dynamic>?)
          ?.map(
            (e) => AdminCreateShippingOptionRule.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
      metadata: json['metadata'],
    );

Map<String, dynamic> _$AdminCreateCalculatedShippingOptionToJson(
  AdminCreateCalculatedShippingOption instance,
) => <String, dynamic>{
  'price_type':
      _$AdminCreateCalculatedShippingOptionPriceTypeEnumMap[instance
          .priceType]!,
  'name': instance.name,
  'service_zone_id': instance.serviceZoneId,
  'shipping_profile_id': instance.shippingProfileId,
  'data': instance.data,
  'provider_id': instance.providerId,
  'type': instance.type,
  'type_id': instance.typeId,
  'rules': instance.rules,
  'metadata': instance.metadata,
};

const _$AdminCreateCalculatedShippingOptionPriceTypeEnumMap = {
  AdminCreateCalculatedShippingOptionPriceType.calculated: 'calculated',
  AdminCreateCalculatedShippingOptionPriceType.flat: 'flat',
  AdminCreateCalculatedShippingOptionPriceType.$unknown: r'$unknown',
};
