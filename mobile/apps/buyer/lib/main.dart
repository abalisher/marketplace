import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ui_kit/app_theme.dart';

import 'features/assistant/providers/chat_history_store_provider.dart';
import 'router/app_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Локальное хранилище истории диалогов (T2.5) — реальный инстанс отдаём в
  // провайдер-заглушку на старте, чтобы синхронные читатели не ждали диск.
  final prefs = await SharedPreferences.getInstance();
  runApp(
    ProviderScope(
      overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
      child: const BuyerApp(),
    ),
  );
}

/// Корень приложения покупателя: светлая/тёмная тема дизайн-системы (переключение
/// за системной настройкой) и роутер с гардами авторизации (см. [routerProvider]).
class BuyerApp extends ConsumerWidget {
  const BuyerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Marketplace',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      darkTheme: buildAppTheme(brightness: Brightness.dark),
      routerConfig: router,
    );
  }
}
