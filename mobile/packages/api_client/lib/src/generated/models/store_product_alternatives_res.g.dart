// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_product_alternatives_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreProductAlternativesRes _$StoreProductAlternativesResFromJson(
  Map<String, dynamic> json,
) => StoreProductAlternativesRes(
  alternatives: (json['alternatives'] as List<dynamic>)
      .map((e) => StoreProductAlternative.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$StoreProductAlternativesResToJson(
  StoreProductAlternativesRes instance,
) => <String, dynamic>{'alternatives': instance.alternatives};
