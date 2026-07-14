// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'summary.g.dart';

@JsonSerializable()
class Summary {
  const Summary({required this.toCreate, required this.toUpdate});

  factory Summary.fromJson(Map<String, Object?> json) =>
      _$SummaryFromJson(json);

  /// The number of products that will be created by this import.
  final num toCreate;

  /// The number of products that will be updated by this import.
  final num toUpdate;

  Map<String, Object?> toJson() => _$SummaryToJson(this);
}
