// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_request_order_transfer.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminRequestOrderTransfer _$AdminRequestOrderTransferFromJson(
  Map<String, dynamic> json,
) => AdminRequestOrderTransfer(
  customerId: json['customer_id'] as String,
  updateOrderEmail: json['update_order_email'] as bool? ?? false,
  description: json['description'] as String?,
  internalNote: json['internal_note'] as String?,
);

Map<String, dynamic> _$AdminRequestOrderTransferToJson(
  AdminRequestOrderTransfer instance,
) => <String, dynamic>{
  'customer_id': instance.customerId,
  'description': ?instance.description,
  'internal_note': ?instance.internalNote,
  'update_order_email': instance.updateOrderEmail,
};
