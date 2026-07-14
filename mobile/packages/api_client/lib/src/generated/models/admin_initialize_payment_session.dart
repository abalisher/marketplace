// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_initialize_payment_session.g.dart';

/// The details of the payment session to initialize in the payment collection.
@JsonSerializable()
class AdminInitializePaymentSession {
  const AdminInitializePaymentSession({required this.providerId, this.data});

  factory AdminInitializePaymentSession.fromJson(Map<String, Object?> json) =>
      _$AdminInitializePaymentSessionFromJson(json);

  /// The ID of the payment provider to initialize the session with.
  @JsonKey(name: 'provider_id')
  final String providerId;

  /// Any data necessary for the payment provider to process the payment.
  final dynamic data;

  Map<String, Object?> toJson() => _$AdminInitializePaymentSessionToJson(this);
}
