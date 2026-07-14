// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'base_payment_provider.g.dart';

/// The payment provider's details.
@JsonSerializable()
class BasePaymentProvider {
  const BasePaymentProvider({required this.id});

  factory BasePaymentProvider.fromJson(Map<String, Object?> json) =>
      _$BasePaymentProviderFromJson(json);

  /// The payment provider's ID.
  final String id;

  Map<String, Object?> toJson() => _$BasePaymentProviderToJson(this);
}
