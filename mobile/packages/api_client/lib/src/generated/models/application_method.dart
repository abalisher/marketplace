// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'type2.dart';

part 'application_method.g.dart';

@JsonSerializable()
class ApplicationMethod {
  const ApplicationMethod({
    required this.value,
    required this.type,
    required this.currencyCode,
  });

  factory ApplicationMethod.fromJson(Map<String, Object?> json) =>
      _$ApplicationMethodFromJson(json);

  /// The application method's value.
  final String value;

  /// The application method's type.
  final Type2 type;

  /// The application method's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  Map<String, Object?> toJson() => _$ApplicationMethodToJson(this);
}
