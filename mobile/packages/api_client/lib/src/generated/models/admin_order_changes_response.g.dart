// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_changes_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderChangesResponse _$AdminOrderChangesResponseFromJson(
  Map<String, dynamic> json,
) => AdminOrderChangesResponse(
  orderChanges: (json['order_changes'] as List<dynamic>)
      .map((e) => AdminOrderChange.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminOrderChangesResponseToJson(
  AdminOrderChangesResponse instance,
) => <String, dynamic>{'order_changes': instance.orderChanges};
