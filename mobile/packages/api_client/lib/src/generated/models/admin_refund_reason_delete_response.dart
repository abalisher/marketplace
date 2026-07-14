// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_refund_reason_delete_response.g.dart';

/// The deletion's details.
@JsonSerializable()
class AdminRefundReasonDeleteResponse {
  const AdminRefundReasonDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'refund_reason',
  });

  factory AdminRefundReasonDeleteResponse.fromJson(Map<String, Object?> json) =>
      _$AdminRefundReasonDeleteResponseFromJson(json);

  /// The refund reason's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the refund reason was deleted.
  final bool deleted;

  Map<String, Object?> toJson() =>
      _$AdminRefundReasonDeleteResponseToJson(this);
}
