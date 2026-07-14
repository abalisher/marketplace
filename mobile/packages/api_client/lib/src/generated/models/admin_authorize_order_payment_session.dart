// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_authorize_order_payment_session.g.dart';

/// The details for authorizing a payment session for an order.
@JsonSerializable()
class AdminAuthorizeOrderPaymentSession {
  const AdminAuthorizeOrderPaymentSession({required this.paymentSessionId});

  factory AdminAuthorizeOrderPaymentSession.fromJson(
    Map<String, Object?> json,
  ) => _$AdminAuthorizeOrderPaymentSessionFromJson(json);

  /// The payment session's ID.
  @JsonKey(name: 'payment_session_id')
  final String paymentSessionId;

  Map<String, Object?> toJson() =>
      _$AdminAuthorizeOrderPaymentSessionToJson(this);
}
