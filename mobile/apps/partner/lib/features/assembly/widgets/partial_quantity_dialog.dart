import 'package:flutter/material.dart';
import 'package:ui_kit/app_text_field.dart';

import '../../../l10n/messages.dart';

/// Диалог «сколько набрали» для частичной отметки. Возвращает количество или
/// null, если сборщик передумал.
///
/// Ввод с клавиатуры, а не счётчик «−/+»: частичное количество бывает любым
/// (17 мешков из 40), и набирать его нажатиями у полки невозможно. Границы —
/// от 1 до [quantity] − 1: «всё» и «ничего» это другие две кнопки.
class PartialQuantityDialog extends StatefulWidget {
  const PartialQuantityDialog({
    required this.quantity,
    required this.initial,
    required this.t,
    super.key,
  });

  /// Сколько нужно по позиции.
  final int quantity;

  /// Что показать в поле при открытии (предыдущая отметка, если была).
  final int? initial;

  final Messages t;

  @override
  State<PartialQuantityDialog> createState() => _PartialQuantityDialogState();
}

class _PartialQuantityDialogState extends State<PartialQuantityDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _controller = TextEditingController(
    text: widget.initial?.toString() ?? '',
  );

  int get _max => widget.quantity - 1;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    Navigator.of(context).pop(int.parse(_controller.text.trim()));
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.t;
    return AlertDialog(
      title: Text(t.partialTitle),
      content: Form(
        key: _formKey,
        child: AppTextField(
          controller: _controller,
          label: t.quantityLabel,
          helperText: t.partialRange(_max),
          keyboardType: TextInputType.number,
          textInputAction: TextInputAction.done,
          onFieldSubmitted: (_) => _submit(),
          validator: (value) {
            final parsed = int.tryParse((value ?? '').trim());
            if (parsed == null || parsed < 1 || parsed > _max) {
              return t.partialRange(_max);
            }
            return null;
          },
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text(t.cancel),
        ),
        FilledButton(onPressed: _submit, child: Text(t.save)),
      ],
    );
  }
}

/// Открывает [PartialQuantityDialog] и возвращает выбранное количество.
Future<int?> askPartialQuantity(
  BuildContext context, {
  required int quantity,
  required int? initial,
  required Messages t,
}) {
  return showDialog<int>(
    context: context,
    builder: (context) =>
        PartialQuantityDialog(quantity: quantity, initial: initial, t: t),
  );
}
