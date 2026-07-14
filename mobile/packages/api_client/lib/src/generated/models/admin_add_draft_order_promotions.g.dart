// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_add_draft_order_promotions.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAddDraftOrderPromotions _$AdminAddDraftOrderPromotionsFromJson(
  Map<String, dynamic> json,
) => AdminAddDraftOrderPromotions(
  promoCodes: (json['promo_codes'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
);

Map<String, dynamic> _$AdminAddDraftOrderPromotionsToJson(
  AdminAddDraftOrderPromotions instance,
) => <String, dynamic>{'promo_codes': instance.promoCodes};
