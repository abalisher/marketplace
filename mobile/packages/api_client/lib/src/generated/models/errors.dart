// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'errors.g.dart';

@JsonSerializable()
class Errors {
  const Errors({
    required this.error,
    required this.action,
    required this.handlerType,
  });

  factory Errors.fromJson(Map<String, Object?> json) => _$ErrorsFromJson(json);

  /// The error's details.
  final dynamic error;

  /// The error's action.
  final String action;

  /// The error's handler type.
  final String handlerType;

  Map<String, Object?> toJson() => _$ErrorsToJson(this);
}
