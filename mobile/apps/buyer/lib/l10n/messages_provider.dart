import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_locale.dart';
import 'messages.dart';
import 'messages_kk.dart';
import 'messages_ru.dart';

/// Текущая локаль приложения. По умолчанию — русская; переключается
/// переопределением/обновлением состояния (экран настроек — позже).
final localeProvider = StateProvider<AppLocale>((ref) => AppLocale.ru);

/// Строки для текущей локали. Виджеты читают тексты только отсюда.
final messagesProvider = Provider<Messages>((ref) {
  switch (ref.watch(localeProvider)) {
    case AppLocale.ru:
      return const MessagesRu();
    case AppLocale.kk:
      return const MessagesKk();
  }
});
