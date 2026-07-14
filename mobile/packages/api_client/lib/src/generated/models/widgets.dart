// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'widgets.g.dart';

@JsonSerializable()
class Widgets {
  const Widgets({this.hidden, this.section, this.order});

  factory Widgets.fromJson(Map<String, Object?> json) =>
      _$WidgetsFromJson(json);

  /// Whether the widget is hidden.
  final bool? hidden;

  /// The section of the layout where the widget is placed.
  final String? section;

  /// The widget's order.
  final num? order;

  Map<String, Object?> toJson() => _$WidgetsToJson(this);
}
