// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'widgets2.g.dart';

@JsonSerializable()
class Widgets2 {
  const Widgets2({this.hidden, this.section, this.order});

  factory Widgets2.fromJson(Map<String, Object?> json) =>
      _$Widgets2FromJson(json);

  /// Whether the widget is hidden in the layout.
  final bool? hidden;

  /// The section of the layout where the widget is placed.
  final String? section;

  /// The widget's order.
  final num? order;

  Map<String, Object?> toJson() => _$Widgets2ToJson(this);
}
