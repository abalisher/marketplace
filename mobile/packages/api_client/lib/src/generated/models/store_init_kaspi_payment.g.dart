// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_init_kaspi_payment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreInitKaspiPayment _$StoreInitKaspiPaymentFromJson(
  Map<String, dynamic> json,
) => StoreInitKaspiPayment(
  scenario: json['scenario'] == null
      ? null
      : StoreInitKaspiPaymentScenario.fromJson(json['scenario'] as String),
);

Map<String, dynamic> _$StoreInitKaspiPaymentToJson(
  StoreInitKaspiPayment instance,
) => <String, dynamic>{
  'scenario': _$StoreInitKaspiPaymentScenarioEnumMap[instance.scenario],
};

const _$StoreInitKaspiPaymentScenarioEnumMap = {
  StoreInitKaspiPaymentScenario.pending: 'pending',
  StoreInitKaspiPaymentScenario.paid: 'paid',
  StoreInitKaspiPaymentScenario.canceled: 'canceled',
  StoreInitKaspiPaymentScenario.error: 'error',
  StoreInitKaspiPaymentScenario.$unknown: r'$unknown',
};
