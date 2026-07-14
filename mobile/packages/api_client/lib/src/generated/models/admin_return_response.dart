// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_return.dart';

part 'admin_return_response.g.dart';

/// The return's details.
@JsonSerializable()
class AdminReturnResponse {
  const AdminReturnResponse({required this.returnValue});

  factory AdminReturnResponse.fromJson(Map<String, Object?> json) =>
      _$AdminReturnResponseFromJson(json);

  /// The name has been replaced because it contains a keyword. Original name: `return`.
  @JsonKey(name: 'return')
  final AdminReturn returnValue;

  Map<String, Object?> toJson() => _$AdminReturnResponseToJson(this);
}
