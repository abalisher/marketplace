// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'type.dart';

part 'budget.g.dart';

@JsonSerializable()
class Budget {
  const Budget({
    required this.id,
    required this.type,
    required this.currencyCode,
    required this.limit,
    required this.used,
    required this.attribute,
  });

  factory Budget.fromJson(Map<String, Object?> json) => _$BudgetFromJson(json);

  /// The budget's ID.
  final String id;

  /// The budget's type. `spend` means the limit is set on the total amount discounted by the campaign's promotions; `usage` means the limit is set on the total number of times the campaign's promotions can be used.
  ///
  final Type type;

  /// The budget's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The budget's limit.
  final num limit;

  /// How much of the budget has been used. If the limit is `spend`, this property holds the total amount discounted so far. If the limit is `usage`, it holds the number of times the campaign's promotions have been used so far.
  ///
  final num used;

  /// The cart attribute to limit the budget by.
  final String attribute;

  Map<String, Object?> toJson() => _$BudgetToJson(this);
}
