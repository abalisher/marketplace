// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_add_claim_outbound_items.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAddClaimOutboundItems _$AdminAddClaimOutboundItemsFromJson(
  Map<String, dynamic> json,
) => AdminAddClaimOutboundItems(
  items: (json['items'] as List<dynamic>?)
      ?.map((e) => Items2.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminAddClaimOutboundItemsToJson(
  AdminAddClaimOutboundItems instance,
) => <String, dynamic>{'items': instance.items};
