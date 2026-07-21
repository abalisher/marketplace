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
);

Map<String, dynamic> _$AdminTransitionDisputeToJson(
  AdminTransitionDispute instance,
) => <String, dynamic>{
  'to': _$AdminTransitionDisputeToEnumMap[instance.to]!,
  'resolution': instance.resolution,
};

const _$AdminTransitionDisputeToEnumMap = {
  AdminTransitionDisputeTo.inReview: 'in_review',
  AdminTransitionDisputeTo.resolved: 'resolved',
  AdminTransitionDisputeTo.rejected: 'rejected',
  AdminTransitionDisputeTo.$unknown: r'$unknown',
};
