import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ui_kit/app_theme.dart';

import 'features/assembly/providers/pending_mark_store_provider.dart';
import 'l10n/messages_provider.dart';
import 'router/app_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Очередь неотправленных отметок читается синхронно при первом обращении —
  // реальный инстанс отдаём в провайдер-заглушку на старте (идиома buyer).
  final prefs = await SharedPreferences.getInstance();
  runApp(
    ProviderScope(
      overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
      child: const PartnerApp(),
    ),
  );
}

/// Корень приложения персонала поставщика: тема дизайн-системы (светлая/тёмная
/// за системной настройкой) и роутер с гардом сессии сотрудника.
class PartnerApp extends ConsumerWidget {
  const PartnerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: ref.watch(messagesProvider).appTitle,
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      darkTheme: buildAppTheme(brightness: Brightness.dark),
      routerConfig: router,
    );
  }
}
