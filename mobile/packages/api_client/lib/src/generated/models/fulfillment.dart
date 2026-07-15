// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'fulfillment.g.dart';

@JsonSerializable()
class Fulfillment {
  const Fulfillment({this.id});

  factory Fulfillment.fromJson(Map<String, Object?> json) =>
      _$FulfillmentFromJson(json);

  final String? id;

  Map<String, Object?> toJson() => _$FulfillmentToJson(this);
}
