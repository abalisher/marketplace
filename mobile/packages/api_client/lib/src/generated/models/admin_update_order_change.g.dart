// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_order_change.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateOrderChange _$AdminUpdateOrderChangeFromJson(
  Map<String, dynamic> json,
) => AdminUpdateOrderChange(
  carryOverPromotions: json['carry_over_promotions'] as bool?,
  internalNote: json['internal_note'] as String?,
);

Map<String, dynamic> _$AdminUpdateOrderChangeToJson(
  AdminUpdateOrderChange instance,
) => <String, dynamic>{
  'carry_over_promotions': ?instance.carryOverPromotions,
  'internal_note': ?instance.internalNote,
};
