// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_line_input.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderLineInput _$AdminOrderLineInputFromJson(Map<String, dynamic> json) =>
    AdminOrderLineInput(
      id: json['id'] as String,
      quantity: (json['quantity'] as num).toInt(),
    );

Map<String, dynamic> _$AdminOrderLineInputToJson(
  AdminOrderLineInput instance,
) => <String, dynamic>{'id': instance.id, 'quantity': instance.quantity};
