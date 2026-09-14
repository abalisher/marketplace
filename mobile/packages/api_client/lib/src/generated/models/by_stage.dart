// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'by_stage.g.dart';

@JsonSerializable()
class ByStage {
  const ByStage({
    required this.assembling,
    required this.ready,
    required this.shortage,
  });

  factory ByStage.fromJson(Map<String, Object?> json) =>
      _$ByStageFromJson(json);

  final num assembling;
  final num ready;
  final num shortage;

  Map<String, Object?> toJson() => _$ByStageToJson(this);
}
