// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_estimate_suggestion.dart';

part 'store_estimate_suggestions_res.g.dart';

@JsonSerializable()
class StoreEstimateSuggestionsRes {
  const StoreEstimateSuggestionsRes({
    required this.estimateId,
    required this.currencyCode,
    required this.suggestions,
  });

  factory StoreEstimateSuggestionsRes.fromJson(Map<String, Object?> json) =>
      _$StoreEstimateSuggestionsResFromJson(json);

  @JsonKey(name: 'estimate_id')
  final String estimateId;
  @JsonKey(name: 'currency_code')
  final String currencyCode;
  final List<StoreEstimateSuggestion> suggestions;

  Map<String, Object?> toJson() => _$StoreEstimateSuggestionsResToJson(this);
}
