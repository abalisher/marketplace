// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_return_reason.dart';

part 'admin_return_reason_response.g.dart';

/// The return reason's details.
@JsonSerializable()
class AdminReturnReasonResponse {
  const AdminReturnReasonResponse({required this.returnReason});

  factory AdminReturnReasonResponse.fromJson(Map<String, Object?> json) =>
      _$AdminReturnReasonResponseFromJson(json);

  @JsonKey(name: 'return_reason')
  final AdminReturnReason returnReason;

  Map<String, Object?> toJson() => _$AdminReturnReasonResponseToJson(this);
}
