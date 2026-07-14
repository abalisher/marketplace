// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_remove_draft_order_promotions.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminRemoveDraftOrderPromotions _$AdminRemoveDraftOrderPromotionsFromJson(
  Map<String, dynamic> json,
) => AdminRemoveDraftOrderPromotions(
  promoCodes: (json['promo_codes'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
);

Map<String, dynamic> _$AdminRemoveDraftOrderPromotionsToJson(
  AdminRemoveDraftOrderPromotions instance,
) => <String, dynamic>{'promo_codes': instance.promoCodes};
