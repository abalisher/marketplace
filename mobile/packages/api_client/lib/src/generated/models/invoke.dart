// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'output.dart';

part 'invoke.g.dart';

@JsonSerializable()
class Invoke {
  const Invoke({this.output});

  factory Invoke.fromJson(Map<String, Object?> json) => _$InvokeFromJson(json);

  /// The invokation's details.
  final Output? output;

  Map<String, Object?> toJson() => _$InvokeToJson(this);
}
