// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_add_claim_items.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAddClaimItems _$AdminAddClaimItemsFromJson(Map<String, dynamic> json) =>
    AdminAddClaimItems(
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => Items.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminAddClaimItemsToJson(AdminAddClaimItems instance) =>
    <String, dynamic>{'items': ?instance.items};
