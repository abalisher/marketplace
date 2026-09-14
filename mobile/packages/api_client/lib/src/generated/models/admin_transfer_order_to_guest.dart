// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_transfer_order_to_guest.g.dart';

/// The details of the order transfer to a guest.
@JsonSerializable()
class AdminTransferOrderToGuest {
  const AdminTransferOrderToGuest({
    required this.email,
    this.internalNote,
    this.description,
  });

  factory AdminTransferOrderToGuest.fromJson(Map<String, Object?> json) =>
      _$AdminTransferOrderToGuestFromJson(json);

  /// The email to which the order will be transferred.
  final String email;

  /// The internal note for the order transfer.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// Details of the order transfer to a guest.
  final String? description;

  Map<String, Object?> toJson() => _$AdminTransferOrderToGuestToJson(this);
}
