// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'type.dart';

part 'budget2.g.dart';

@JsonSerializable()
class Budget2 {
  const Budget2({
    required this.id,
    required this.type,
    required this.currencyCode,
    required this.limit,
    required this.used,
  });

  factory Budget2.fromJson(Map<String, Object?> json) =>
      _$Budget2FromJson(json);

  /// The budget's ID.
  final String id;
  final Type type;

  /// The budget's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The budget's limit.
  final num limit;

  /// The budget's used.
  final num used;

  Map<String, Object?> toJson() => _$Budget2ToJson(this);
}
