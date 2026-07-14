// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_claim_type.dart';

part 'admin_create_claim.g.dart';

/// The claim's details.
@JsonSerializable()
class AdminCreateClaim {
  const AdminCreateClaim({
    required this.type,
    required this.orderId,
    this.description,
    this.internalNote,
    this.reasonId,
    this.metadata,
  });

  factory AdminCreateClaim.fromJson(Map<String, Object?> json) =>
      _$AdminCreateClaimFromJson(json);

  /// The claim's type.
  final AdminCreateClaimType type;

  /// The ID of the order the claim is created for.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The claim's description.
  final String? description;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The ID of the associated return reason.
  @JsonKey(name: 'reason_id')
  final String? reasonId;

  /// The claim's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreateClaimToJson(this);
}
