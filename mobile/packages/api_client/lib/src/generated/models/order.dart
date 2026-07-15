// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

@JsonEnum()
enum Order {
  @JsonValue('created_at')
  createdAt('created_at'),
  @JsonValue('-created_at')
  minusCreatedAt('-created_at'),
  @JsonValue('updated_at')
  updatedAt('updated_at'),
  @JsonValue('-updated_at')
  minusUpdatedAt('-updated_at'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const Order(this.json);

  factory Order.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<Order> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
