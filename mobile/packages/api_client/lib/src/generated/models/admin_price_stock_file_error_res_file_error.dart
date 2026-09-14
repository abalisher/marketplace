// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

@JsonEnum()
enum AdminPriceStockFileErrorResFileError {
  @JsonValue('empty_file')
  emptyFile('empty_file'),
  @JsonValue('no_columns')
  noColumns('no_columns'),
  @JsonValue('too_many_rows')
  tooManyRows('too_many_rows'),
  @JsonValue('mixed_locations')
  mixedLocations('mixed_locations'),
  @JsonValue('unknown_location')
  unknownLocation('unknown_location'),
  @JsonValue('location_mismatch')
  locationMismatch('location_mismatch'),
  @JsonValue('too_many_changes')
  tooManyChanges('too_many_changes'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminPriceStockFileErrorResFileError(this.json);

  factory AdminPriceStockFileErrorResFileError.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminPriceStockFileErrorResFileError> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
