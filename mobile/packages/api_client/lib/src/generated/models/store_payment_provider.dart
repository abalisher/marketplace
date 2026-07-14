// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_payment_provider.g.dart';

/// The payment provider's details
@JsonSerializable()
class StorePaymentProvider {
  const StorePaymentProvider({required this.id});

  factory StorePaymentProvider.fromJson(Map<String, Object?> json) =>
      _$StorePaymentProviderFromJson(json);

  /// The payment provider's ID.
  final String id;

  Map<String, Object?> toJson() => _$StorePaymentProviderToJson(this);
}
