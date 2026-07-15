// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

@JsonEnum()
enum StoreOrderLifecycleSummaryStatus {
  /// The name has been replaced because it contains a keyword. Original name: `new`.
  @JsonValue('new')
  valueNew('new'),
  @JsonValue('confirmed')
  confirmed('confirmed'),
  @JsonValue('assembling')
  assembling('assembling'),
  @JsonValue('partially_assembled')
  partiallyAssembled('partially_assembled'),
  @JsonValue('assembled')
  assembled('assembled'),
  @JsonValue('in_delivery')
  inDelivery('in_delivery'),
  @JsonValue('delivered')
  delivered('delivered'),
  @JsonValue('closed')
  closed('closed'),
  @JsonValue('canceled')
  canceled('canceled'),
  @JsonValue('returned')
  returned('returned'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const StoreOrderLifecycleSummaryStatus(this.json);

  factory StoreOrderLifecycleSummaryStatus.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<StoreOrderLifecycleSummaryStatus> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
