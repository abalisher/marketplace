// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'base_capture.g.dart';

/// The details of a captured payment.
@JsonSerializable()
class BaseCapture {
  const BaseCapture({
    required this.id,
    required this.amount,
    required this.createdAt,
    required this.payment,
    this.createdBy,
  });

  factory BaseCapture.fromJson(Map<String, Object?> json) =>
      _$BaseCaptureFromJson(json);

  /// The payment capture's ID.
  final String id;

  /// The captured amount.
  final num amount;

  /// The date the capture was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The ID of the user that captured the payment.
  @JsonKey(name: 'created_by')
  final String? createdBy;
  final dynamic payment;

  Map<String, Object?> toJson() => _$BaseCaptureToJson(this);
}
