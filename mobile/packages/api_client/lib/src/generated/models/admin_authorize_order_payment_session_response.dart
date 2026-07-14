// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order.dart';

part 'admin_authorize_order_payment_session_response.g.dart';

/// The details of the response after authorizing a payment session for an order.
@JsonSerializable()
class AdminAuthorizeOrderPaymentSessionResponse {
  const AdminAuthorizeOrderPaymentSessionResponse({
    required this.order,
    required this.isAuthorized,
  });

  factory AdminAuthorizeOrderPaymentSessionResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminAuthorizeOrderPaymentSessionResponseFromJson(json);

  final AdminOrder order;

  /// Whether the payment session was successfully authorized.
  @JsonKey(name: 'is_authorized')
  final bool isAuthorized;

  Map<String, Object?> toJson() =>
      _$AdminAuthorizeOrderPaymentSessionResponseToJson(this);
}
