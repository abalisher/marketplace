// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_currency_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCurrencyResponse _$AdminCurrencyResponseFromJson(
  Map<String, dynamic> json,
) => AdminCurrencyResponse(
  currency: AdminCurrency.fromJson(json['currency'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminCurrencyResponseToJson(
  AdminCurrencyResponse instance,
) => <String, dynamic>{'currency': instance.currency};
