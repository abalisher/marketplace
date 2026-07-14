// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'invoke.dart';

part 'data2.g.dart';

@JsonSerializable()
class Data2 {
  const Data2({required this.invoke, this.payload});

  factory Data2.fromJson(Map<String, Object?> json) => _$Data2FromJson(json);

  /// The step's invokation details.
  final Map<String, Invoke> invoke;

  /// the payload of the transaction.
  final dynamic payload;

  Map<String, Object?> toJson() => _$Data2ToJson(this);
}
