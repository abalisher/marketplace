// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'widgets2.dart';

part 'configuration3.g.dart';

@JsonSerializable()
class Configuration3 {
  const Configuration3({required this.widgets});

  factory Configuration3.fromJson(Map<String, Object?> json) =>
      _$Configuration3FromJson(json);

  /// The widgets configuration for the layout. Each key represents a widget's ID, and the value is an object containing the widget's configuration details.
  final Map<String, Widgets2> widgets;

  Map<String, Object?> toJson() => _$Configuration3ToJson(this);
}
