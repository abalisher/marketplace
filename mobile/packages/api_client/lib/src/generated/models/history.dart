// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'version.dart';

part 'history.g.dart';

@JsonSerializable()
class History {
  const History({required this.version});

  factory History.fromJson(Map<String, Object?> json) =>
      _$HistoryFromJson(json);

  /// The version changes of the item.
  final Version version;

  Map<String, Object?> toJson() => _$HistoryToJson(this);
}
