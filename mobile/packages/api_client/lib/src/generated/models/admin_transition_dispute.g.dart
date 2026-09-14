// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_transition_dispute.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTransitionDispute _$AdminTransitionDisputeFromJson(
  Map<String, dynamic> json,
) => AdminTransitionDispute(
  to: AdminTransitionDisputeTo.fromJson(json['to'] as String),
  resolution: json['resolution'] as String?,
  outcome: json['outcome'] == null
      ? null
      : AdminTransitionDisputeOutcome.fromJson(json['outcome'] as String),
);

Map<String, dynamic> _$AdminTransitionDisputeToJson(
  AdminTransitionDispute instance,
) => <String, dynamic>{
  'to': _$AdminTransitionDisputeToEnumMap[instance.to]!,
  'resolution': ?instance.resolution,
  'outcome': ?_$AdminTransitionDisputeOutcomeEnumMap[instance.outcome],
};

const _$AdminTransitionDisputeToEnumMap = {
  AdminTransitionDisputeTo.inReview: 'in_review',
  AdminTransitionDisputeTo.resolved: 'resolved',
  AdminTransitionDisputeTo.rejected: 'rejected',
  AdminTransitionDisputeTo.$unknown: r'$unknown',
};

const _$AdminTransitionDisputeOutcomeEnumMap = {
  AdminTransitionDisputeOutcome.refund: 'refund',
  AdminTransitionDisputeOutcome.redelivery: 'redelivery',
  AdminTransitionDisputeOutcome.replacement: 'replacement',
  AdminTransitionDisputeOutcome.bonus: 'bonus',
  AdminTransitionDisputeOutcome.none: 'none',
  AdminTransitionDisputeOutcome.$unknown: r'$unknown',
};
