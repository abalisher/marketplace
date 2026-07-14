// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_return_reason.dart';

part 'store_return_reason_response.g.dart';

/// The return reason's details.
@JsonSerializable()
class StoreReturnReasonResponse {
  const StoreReturnReasonResponse({required this.returnReason});

  factory StoreReturnReasonResponse.fromJson(Map<String, Object?> json) =>
      _$StoreReturnReasonResponseFromJson(json);

  @JsonKey(name: 'return_reason')
  final StoreReturnReason returnReason;

  Map<String, Object?> toJson() => _$StoreReturnReasonResponseToJson(this);
}
