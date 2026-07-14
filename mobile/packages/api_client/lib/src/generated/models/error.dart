// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'error.g.dart';

@JsonSerializable()
class Error {
  const Error({required this.message, required this.name, required this.type});

  factory Error.fromJson(Map<String, Object?> json) => _$ErrorFromJson(json);

  /// The error's message.
  final String message;

  /// The error's name.
  final String name;

  /// The error's type. Can be a [MedusaError type](https://docs.medusajs.com/learn/fundamentals/api-routes/errors#medusaerror-types) or `payment_authorization_error` or `payment_requires_more_error` for payment-related errors.
  ///
  final String type;

  Map<String, Object?> toJson() => _$ErrorToJson(this);
}
