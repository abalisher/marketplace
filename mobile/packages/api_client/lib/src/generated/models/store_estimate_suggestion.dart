// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_estimate_suggestion_option.dart';

part 'store_estimate_suggestion.g.dart';

@JsonSerializable()
class StoreEstimateSuggestion {
  const StoreEstimateSuggestion({
    required this.lineId,
    required this.materialKind,
    required this.quantity,
    required this.unit,
    required this.options,
  });

  factory StoreEstimateSuggestion.fromJson(Map<String, Object?> json) =>
      _$StoreEstimateSuggestionFromJson(json);

  @JsonKey(name: 'line_id')
  final String lineId;
  @JsonKey(name: 'material_kind')
  final String materialKind;
  final num quantity;
  final String unit;
  final List<StoreEstimateSuggestionOption> options;

  Map<String, Object?> toJson() => _$StoreEstimateSuggestionToJson(this);
}
