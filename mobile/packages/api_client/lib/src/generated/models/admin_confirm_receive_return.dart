// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_confirm_receive_return.g.dart';

/// The confirmation's details.
@JsonSerializable()
class AdminConfirmReceiveReturn {
  const AdminConfirmReceiveReturn({this.noNotification});

  factory AdminConfirmReceiveReturn.fromJson(Map<String, Object?> json) =>
      _$AdminConfirmReceiveReturnFromJson(json);

  /// Whether to send the customer a notification about the confirmation.
  @JsonKey(name: 'no_notification')
  final bool? noNotification;

  Map<String, Object?> toJson() => _$AdminConfirmReceiveReturnToJson(this);
}
