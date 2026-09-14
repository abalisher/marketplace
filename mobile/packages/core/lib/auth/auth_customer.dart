/// Презентационная модель авторизованного покупателя — тонкая проекция
/// `StoreCustomer`. Экраны зависят от неё, а не от сгенерированных DTO
/// (та же граница, что у каталога/корзины). Пустые имя/фамилия нормализуются
/// в null на границе репозитория.
class AuthCustomer {
  const AuthCustomer({
    required this.id,
    this.email,
    this.firstName,
    this.lastName,
    this.phone,
  });

  final String id;

  /// Email есть только у учёток, заведённых по email: вход по номеру телефона
  /// его не спрашивает (профиль MVP — телефон + ФИО + адрес).
  final String? email;
  final String? firstName;
  final String? lastName;
  final String? phone;

  /// Отображаемое имя: «Имя Фамилия», иначе — доступная часть, иначе номер
  /// телефона (вход по номеру), иначе email.
  String get displayName {
    final parts = [
      firstName,
      lastName,
    ].where((part) => part != null && part.isNotEmpty).cast<String>();
    if (parts.isNotEmpty) return parts.join(' ');
    return phone ?? email ?? '';
  }

  /// Строка-контакт под именем в кабинете: номер, иначе email.
  String get contact => phone ?? email ?? '';
}
