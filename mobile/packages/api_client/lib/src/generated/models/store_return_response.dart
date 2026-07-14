// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_return.dart';

part 'store_return_response.g.dart';

/// The return's details.
@JsonSerializable()
class StoreReturnResponse {
  const StoreReturnResponse({required this.returnValue});

  factory StoreReturnResponse.fromJson(Map<String, Object?> json) =>
      _$StoreReturnResponseFromJson(json);

  /// The name has been replaced because it contains a keyword. Original name: `return`.
  @JsonKey(name: 'return')
  final StoreReturn returnValue;

  Map<String, Object?> toJson() => _$StoreReturnResponseToJson(this);
}
