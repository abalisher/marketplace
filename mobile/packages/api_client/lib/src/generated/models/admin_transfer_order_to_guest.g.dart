// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_transfer_order_to_guest.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTransferOrderToGuest _$AdminTransferOrderToGuestFromJson(
  Map<String, dynamic> json,
) => AdminTransferOrderToGuest(
  email: json['email'] as String,
  internalNote: json['internal_note'] as String?,
  description: json['description'] as String?,
);

Map<String, dynamic> _$AdminTransferOrderToGuestToJson(
  AdminTransferOrderToGuest instance,
) => <String, dynamic>{
  'email': instance.email,
  'internal_note': ?instance.internalNote,
  'description': ?instance.description,
};
