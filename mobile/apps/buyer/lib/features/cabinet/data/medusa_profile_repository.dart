import 'package:api_client/api_client.dart'
    show MedusaStoreApi, StoreCustomerAddress;

import '../domain/buyer_profile.dart';
import 'profile_repository.dart';

/// Реализация [ProfileRepository] поверх ядрового `/store/customers/me`.
/// Адрес собираем в одну строку прямо здесь: экран показывает адреса списком,
/// а порядок частей — это правило представления адреса, одинаковое для всех
/// экранов приложения.
class MedusaProfileRepository implements ProfileRepository {
  MedusaProfileRepository(this._api, this._publishableKey);

  final MedusaStoreApi _api;
  final String _publishableKey;

  @override
  Future<BuyerProfile> fetchProfile() async {
    final response = await _api.customers.getCustomersMe(
      xPublishableApiKey: _publishableKey,
    );
    final customer = response.customer;

    String? normalize(String? value) =>
        (value == null || value.isEmpty) ? null : value;

    final name = [
      normalize(customer.firstName),
      normalize(customer.lastName),
    ].whereType<String>().join(' ');

    return BuyerProfile(
      name: name.isEmpty ? null : name,
      phone: normalize(customer.phone),
      addresses: customer.addresses
          .map(_toLine)
          .where((line) => line.isNotEmpty)
          .toList(),
    );
  }

  /// Адрес одной строкой: «ул. Кабанбай батыра, 53, Астана». Индекс и страну не
  /// печатаем — магазин работает по Астане, и в заказах из чата индекс не
  /// заполняется вовсе (то же правило, что на витрине).
  String _toLine(StoreCustomerAddress address) {
    return [
      address.address1,
      address.address2,
      address.city,
    ].where((part) => part.isNotEmpty).join(', ');
  }
}
