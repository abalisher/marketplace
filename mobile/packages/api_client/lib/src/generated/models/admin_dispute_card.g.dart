// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_dispute_card.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDisputeCard _$AdminDisputeCardFromJson(Map<String, dynamic> json) =>
    AdminDisputeCard(
      dispute: AdminDisputeRow.fromJson(
        json['dispute'] as Map<String, dynamic>,
      ),
      slaHours: (json['sla_hours'] as num).toInt(),
      reviews: (json['reviews'] as List<dynamic>)
          .map((e) => AdminReview.fromJson(e as Map<String, dynamic>))
          .toList(),
      customerHistory: AdminDisputeCustomerHistory.fromJson(
        json['customer_history'] as Map<String, dynamic>,
      ),
      order: json['order'] == null
          ? null
          : AdminOrderCard.fromJson(json['order'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AdminDisputeCardToJson(AdminDisputeCard instance) =>
    <String, dynamic>{
      'dispute': instance.dispute,
      'sla_hours': instance.slaHours,
      'order': ?instance.order,
      'reviews': instance.reviews,
      'customer_history': instance.customerHistory,
    };
