// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'widgets.dart';

part 'configuration2.g.dart';

@JsonSerializable()
class Configuration2 {
  const Configuration2({required this.widgets});

  factory Configuration2.fromJson(Map<String, Object?> json) =>
      _$Configuration2FromJson(json);

  /// The configurations of the widgets in the layout. The object's keys are the widget IDs, and the values are objects containing the widget's configuration details.
  final Map<String, Widgets> widgets;

  Map<String, Object?> toJson() => _$Configuration2ToJson(this);
}
