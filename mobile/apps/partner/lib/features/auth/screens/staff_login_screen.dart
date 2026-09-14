import 'package:core/auth/staff_auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_text_field.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../staff_auth_error_message.dart';
import '../staff_auth_validators.dart';

/// Вход сотрудника склада: email и пароль рабочей учётки. Регистрации нет —
/// учётки заводит управляющий (`create-picker-users.ts`), и «зарегистрироваться»
/// на складском телефоне было бы дырой, а не удобством.
///
/// После успеха навигацию делает гард роутера. Собран только из ui_kit.
class StaffLoginScreen extends ConsumerStatefulWidget {
  const StaffLoginScreen({super.key});

  @override
  ConsumerState<StaffLoginScreen> createState() => _StaffLoginScreenState();
}

class _StaffLoginScreenState extends ConsumerState<StaffLoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit(Messages t) async {
    if (!_formKey.currentState!.validate()) return;
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _submitting = true);
    try {
      await ref
          .read(staffAuthControllerProvider.notifier)
          .signIn(email: _email.text.trim(), password: _password.text);
    } catch (error) {
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(content: Text(staffAuthErrorMessage(error, t))),
        );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);
    return Scaffold(
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            children: [
              const SizedBox(height: AppSpacing.xxl),
              Text(t.signInTitle, style: AppTypography.headingMedium),
              const SizedBox(height: AppSpacing.sm),
              Text(
                t.signInSubtitle,
                style: AppTypography.bodyMedium.copyWith(
                  color: colors.inkSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              AppTextField(
                controller: _email,
                label: t.emailLabel,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                enabled: !_submitting,
                validator: (value) => StaffAuthValidators.email(value, t),
              ),
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _password,
                label: t.passwordLabel,
                obscureText: true,
                textInputAction: TextInputAction.done,
                enabled: !_submitting,
                validator: (value) => StaffAuthValidators.password(value, t),
                onFieldSubmitted: (_) => _submit(t),
              ),
              const SizedBox(height: AppSpacing.lg),
              AppPrimaryButton(
                label: t.signInButton,
                onPressed: _submitting ? null : () => _submit(t),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
