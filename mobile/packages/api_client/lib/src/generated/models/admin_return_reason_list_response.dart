// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_return_reason.dart';

part 'admin_return_reason_list_response.g.dart';

/// The paginated list of return reasons.
@JsonSerializable()
class AdminReturnReasonListResponse {
  const AdminReturnReasonListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.returnReasons,
    this.estimateCount,
  });

  factory AdminReturnReasonListResponse.fromJson(Map<String, Object?> json) =>
      _$AdminReturnReasonListResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total number of items.
  final num count;

  /// The list of return reasons.
  @JsonKey(name: 'return_reasons')
  final List<AdminReturnReason> returnReasons;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() => _$AdminReturnReasonListResponseToJson(this);
}
