// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_preference_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPricePreferenceResponse _$AdminPricePreferenceResponseFromJson(
  Map<String, dynamic> json,
) => AdminPricePreferenceResponse(
  pricePreference: AdminPricePreference.fromJson(
    json['price_preference'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminPricePreferenceResponseToJson(
  AdminPricePreferenceResponse instance,
) => <String, dynamic>{'price_preference': instance.pricePreference};
