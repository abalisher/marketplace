// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'raw_quantity.g.dart';

@JsonSerializable()
class RawQuantity {
  const RawQuantity({required this.value});

  factory RawQuantity.fromJson(Map<String, Object?> json) =>
      _$RawQuantityFromJson(json);

  final dynamic value;

  Map<String, Object?> toJson() => _$RawQuantityToJson(this);
}
