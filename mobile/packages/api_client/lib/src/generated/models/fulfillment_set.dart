// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'location.dart';

part 'fulfillment_set.g.dart';

@JsonSerializable()
class FulfillmentSet {
  const FulfillmentSet({
    required this.id,
    required this.type,
    required this.location,
  });

  factory FulfillmentSet.fromJson(Map<String, Object?> json) =>
      _$FulfillmentSetFromJson(json);

  /// The fulfillment set's ID.
  final String id;

  /// The fulfillment set's type.
  final String type;

  /// The fulfillment set's location details.
  final Location location;

  Map<String, Object?> toJson() => _$FulfillmentSetToJson(this);
}
