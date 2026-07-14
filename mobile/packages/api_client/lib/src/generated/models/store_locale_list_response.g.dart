// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_locale_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreLocaleListResponse _$StoreLocaleListResponseFromJson(
  Map<String, dynamic> json,
) => StoreLocaleListResponse(
  locales: (json['locales'] as List<dynamic>)
      .map((e) => StoreLocale.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$StoreLocaleListResponseToJson(
  StoreLocaleListResponse instance,
) => <String, dynamic>{'locales': instance.locales};
