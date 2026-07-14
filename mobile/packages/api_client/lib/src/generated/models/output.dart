// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'output.g.dart';

@JsonSerializable()
class Output {
  const Output({required this.output, required this.compensateInput});

  factory Output.fromJson(Map<String, Object?> json) => _$OutputFromJson(json);

  /// the step's output
  final dynamic output;

  /// the compensation function's input.
  final dynamic compensateInput;

  Map<String, Object?> toJson() => _$OutputToJson(this);
}
