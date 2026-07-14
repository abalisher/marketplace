// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_fulfillment_address.dart';

part 'location.g.dart';

@JsonSerializable()
class Location {
  const Location({required this.id, required this.address});

  factory Location.fromJson(Map<String, Object?> json) =>
      _$LocationFromJson(json);

  /// The location's ID.
  final String id;
  final StoreFulfillmentAddress address;

  Map<String, Object?> toJson() => _$LocationToJson(this);
}
