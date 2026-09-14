import '../domain/buyer_profile.dart';

/// Источник профиля покупателя для кабинета. Отдельный от `core/auth`
/// контракт: аккаунту хватает имени и контакта, кабинету нужны ещё адреса
/// доставки — тянуть их в общую модель авторизации незачем.
abstract interface class ProfileRepository {
  /// Профиль текущего покупателя: ФИО, телефон, адреса.
  Future<BuyerProfile> fetchProfile();
}
