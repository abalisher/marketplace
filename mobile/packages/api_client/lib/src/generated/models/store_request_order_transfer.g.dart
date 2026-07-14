// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_request_order_transfer.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreRequestOrderTransfer _$StoreRequestOrderTransferFromJson(
  Map<String, dynamic> json,
) => StoreRequestOrderTransfer(
  updateOrderEmail: json['update_order_email'] as bool? ?? false,
  description: json['description'] as String?,
);

Map<String, dynamic> _$StoreRequestOrderTransferToJson(
  StoreRequestOrderTransfer instance,
) => <String, dynamic>{
  'description': instance.description,
  'update_order_email': instance.updateOrderEmail,
};
