// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_return.dart';
import 'order.dart';

part 'admin_order_return_response.g.dart';

/// The order return details.
@JsonSerializable()
class AdminOrderReturnResponse {
  const AdminOrderReturnResponse({
    required this.order,
    required this.returnValue,
  });

  factory AdminOrderReturnResponse.fromJson(Map<String, Object?> json) =>
      _$AdminOrderReturnResponseFromJson(json);

  final Order order;

  /// The name has been replaced because it contains a keyword. Original name: `return`.
  @JsonKey(name: 'return')
  final AdminReturn returnValue;

  Map<String, Object?> toJson() => _$AdminOrderReturnResponseToJson(this);
}
