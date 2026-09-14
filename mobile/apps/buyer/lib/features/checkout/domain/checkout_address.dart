/// Адрес доставки, собранный в форме чекаута. Тонкая модель ввода — репозиторий
/// превращает её в DTO обновления корзины. Страна фиксирована KZ (регион
/// маркетплейса — Астана).
class CheckoutAddress {
  const CheckoutAddress({
    required this.firstName,
    required this.lastName,
    required this.address1,
    required this.city,
    required this.postalCode,
    required this.phone,
    this.province,
    this.countryCode = 'kz',
  });

  final String firstName;
  final String lastName;
  final String address1;
  final String city;
  final String postalCode;
  final String phone;
  final String? province;
  final String countryCode;
}
