// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_claim_delete_response.g.dart';

/// The details of the deleted claim.
@JsonSerializable()
class AdminClaimDeleteResponse {
  const AdminClaimDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'claim',
  });

  factory AdminClaimDeleteResponse.fromJson(Map<String, Object?> json) =>
      _$AdminClaimDeleteResponseFromJson(json);

  /// The claim's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the claim was deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$AdminClaimDeleteResponseToJson(this);
}
