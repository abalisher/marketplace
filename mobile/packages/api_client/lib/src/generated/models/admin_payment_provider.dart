// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_payment_provider.g.dart';

/// The payment provider's details.
@JsonSerializable()
class AdminPaymentProvider {
  const AdminPaymentProvider({required this.id, required this.isEnabled});

  factory AdminPaymentProvider.fromJson(Map<String, Object?> json) =>
      _$AdminPaymentProviderFromJson(json);

  /// The payment provider's ID.
  final String id;

  /// Whether the payment provider is enabled.
  @JsonKey(name: 'is_enabled')
  final bool isEnabled;

  Map<String, Object?> toJson() => _$AdminPaymentProviderToJson(this);
}
