// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_shipping_queue_counts.dart';
import 'admin_shipping_queue_order.dart';

part 'admin_shipping_queue_res.g.dart';

@JsonSerializable()
class AdminShippingQueueRes {
  const AdminShippingQueueRes({
    required this.shippingOrders,
    required this.counts,
    required this.count,
    required this.offset,
    required this.limit,
    required this.scanCap,
  });

  factory AdminShippingQueueRes.fromJson(Map<String, Object?> json) =>
      _$AdminShippingQueueResFromJson(json);

  @JsonKey(name: 'shipping_orders')
  final List<AdminShippingQueueOrder> shippingOrders;
  final AdminShippingQueueCounts counts;
  final num count;
  final num offset;
  final num limit;

  /// Потолок просмотра очереди: заказов в очереди может быть больше — экран честно об этом говорит.
  @JsonKey(name: 'scan_cap')
  final num scanCap;

  Map<String, Object?> toJson() => _$AdminShippingQueueResToJson(this);
}
