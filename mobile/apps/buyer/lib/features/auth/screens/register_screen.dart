import 'package:core/auth/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_text_button.dart';
import 'package:ui_kit/app_text_field.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../auth_error_message.dart';
import '../auth_validators.dart';

/// Экран регистрации: обязательны email/пароль, имя/фамилия/телефон —
/// опциональны (создаёт учётку и входит через [AuthController.register]).
/// Навигацию при успехе делает редирект роутера. Собран только из ui_kit.
class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _phone = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _firstName.dispose();
    _lastName.dispose();
    _phone.dispose();
    super.dispose();
  }

  String? _optional(String value) {
    final text = value.trim();
    return text.isEmpty ? null : text;
  }

  Future<void> _submit(Messages messages) async {
    if (!_formKey.currentState!.validate()) return;
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _submitting = true);
    try {
      await ref
          .read(authControllerProvider.notifier)
          .register(
            email: _email.text.trim(),
            password: _password.text,
            firstName: _optional(_firstName.text),
            lastName: _optional(_lastName.text),
            phone: _optional(_phone.text),
          );
    } catch (error) {
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(content: Text(authErrorMessage(error, messages))),
        );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(messagesProvider);
    return Scaffold(
      appBar: AppBar(title: Text(messages.registerTitle)),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            AppTextField(
              controller: _email,
              label: messages.emailLabel,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              enabled: !_submitting,
              validator: (value) => AuthValidators.email(value, messages),
            ),
            const SizedBox(height: AppSpacing.lg),
            AppTextField(
              controller: _password,
              label: messages.passwordLabel,
              obscureText: true,
              textInputAction: TextInputAction.next,
              enabled: !_submitting,
              validator: (value) => AuthValidators.password(value, messages),
            ),
            const SizedBox(height: AppSpacing.lg),
            AppTextField(
              controller: _firstName,
              label: messages.firstNameLabel,
              textInputAction: TextInputAction.next,
              enabled: !_submitting,
            ),
            const SizedBox(height: AppSpacing.lg),
            AppTextField(
              controller: _lastName,
              label: messages.lastNameLabel,
              textInputAction: TextInputAction.next,
              enabled: !_submitting,
            ),
            const SizedBox(height: AppSpacing.lg),
            AppTextField(
              controller: _phone,
              label: messages.phoneLabel,
              keyboardType: TextInputType.phone,
              textInputAction: TextInputAction.done,
              enabled: !_submitting,
              onFieldSubmitted: (_) => _submit(messages),
            ),
            const SizedBox(height: AppSpacing.xl),
            AppPrimaryButton(
              label: messages.registerButton,
              onPressed: _submitting ? null : () => _submit(messages),
            ),
            const SizedBox(height: AppSpacing.sm),
            AppTextButton(
              label: messages.haveAccountPrompt,
              onPressed: _submitting ? null : () => context.pop(),
            ),
          ],
        ),
      ),
    );
  }
}
