// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_cart_promotion.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCartPromotion _$StoreCartPromotionFromJson(Map<String, dynamic> json) =>
    StoreCartPromotion(
      id: json['id'] as String,
      code: json['code'] as String?,
      isAutomatic: json['is_automatic'] as bool?,
      applicationMethod: json['application_method'] == null
          ? null
          : ApplicationMethod.fromJson(
              json['application_method'] as Map<String, dynamic>,
            ),
    );

Map<String, dynamic> _$StoreCartPromotionToJson(StoreCartPromotion instance) =>
    <String, dynamic>{
      'id': instance.id,
      'code': ?instance.code,
      'is_automatic': ?instance.isAutomatic,
      'application_method': ?instance.applicationMethod,
    };
