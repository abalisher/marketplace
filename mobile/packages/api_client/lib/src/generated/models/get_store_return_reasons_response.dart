// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_return_reason.dart';

part 'get_store_return_reasons_response.g.dart';

@JsonSerializable()
class GetStoreReturnReasonsResponse {
  const GetStoreReturnReasonsResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.returnReasons,
  });

  factory GetStoreReturnReasonsResponse.fromJson(Map<String, Object?> json) =>
      _$GetStoreReturnReasonsResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total number of items.
  final num count;

  /// The list of return reasons.
  @JsonKey(name: 'return_reasons')
  final List<StoreReturnReason> returnReasons;

  Map<String, Object?> toJson() => _$GetStoreReturnReasonsResponseToJson(this);
}
