import 'package:flutter_test/flutter_test.dart';

import 'package:marketplace_partner/features/assembly/domain/assembly_item_status.dart';
import 'package:marketplace_partner/features/assembly/domain/assembly_task.dart';
import 'package:marketplace_partner/features/assembly/domain/assembly_task_item.dart';
import 'package:marketplace_partner/features/assembly/domain/assembly_task_status.dart';
import 'package:marketplace_partner/features/assembly/domain/pending_mark.dart';
import 'package:marketplace_partner/features/assembly/pending_mark_rules.dart';

PendingMark _mark(
  String itemId,
  AssemblyItemStatus status, {
  int picked = 0,
  String task = 'task_1',
  int minute = 0,
}) {
  return PendingMark(
    taskId: task,
    itemId: itemId,
    status: status,
    pickedQuantity: picked,
    createdAt: DateTime(2026, 9, 2, 10, minute),
  );
}

AssemblyTask _task({required List<AssemblyTaskItem> items}) {
  return AssemblyTask(
    id: 'task_1',
    orderId: 'order_1',
    orderDisplayId: 43,
    customerName: 'Мадина',
    categoryHandle: 'finishing',
    categoryName: 'Отделочные материалы',
    status: AssemblyTaskStatus.picking,
    itemsTotal: items.length,
    itemsMarked: items.where((item) => item.status.isMarked).length,
    itemsShortage: items.where((item) => item.status.isShortage).length,
    items: items,
  );
}

AssemblyTaskItem _item(
  String id, {
  int quantity = 10,
  int picked = 0,
  AssemblyItemStatus status = AssemblyItemStatus.pending,
}) {
  return AssemblyTaskItem(
    id: id,
    orderItemId: 'oi_$id',
    title: 'Гипсокартон $id',
    quantity: quantity,
    pickedQuantity: picked,
    status: status,
  );
}

void main() {
  group('очередь отметок', () {
    test('новая отметка добавляется в конец', () {
      final queue = mergePendingMark(
        const [],
        _mark('i1', AssemblyItemStatus.picked),
      );
      final next = mergePendingMark(
        queue,
        _mark('i2', AssemblyItemStatus.missing, minute: 1),
      );

      expect(next.map((mark) => mark.itemId), ['i1', 'i2']);
    });

    test(
      'передумал по позиции — на сервер уедет одно решение, на своём месте',
      () {
        var queue = mergePendingMark(
          const [],
          _mark('i1', AssemblyItemStatus.picked),
        );
        queue = mergePendingMark(
          queue,
          _mark('i2', AssemblyItemStatus.missing, minute: 1),
        );
        queue = mergePendingMark(
          queue,
          _mark('i1', AssemblyItemStatus.partial, picked: 4, minute: 2),
        );

        expect(queue.length, 2);
        expect(queue.first.itemId, 'i1');
        expect(queue.first.status, AssemblyItemStatus.partial);
        expect(queue.first.pickedQuantity, 4);
      },
    );

    test('одноимённые позиции РАЗНЫХ заданий не схлопываются', () {
      var queue = mergePendingMark(
        const [],
        _mark('i1', AssemblyItemStatus.picked),
      );
      queue = mergePendingMark(
        queue,
        _mark('i1', AssemblyItemStatus.missing, task: 'task_2', minute: 1),
      );

      expect(queue.length, 2);
    });

    test('отправленные отметки уходят из очереди, остальные остаются', () {
      final sent = _mark('i1', AssemblyItemStatus.picked);
      final rest = _mark('i2', AssemblyItemStatus.missing, minute: 1);
      final queue = removePendingMarks([sent, rest], [sent]);

      expect(queue.map((mark) => mark.itemId), ['i2']);
    });

    test('отметки выбираются по заданию', () {
      final queue = [
        _mark('i1', AssemblyItemStatus.picked),
        _mark('i2', AssemblyItemStatus.missing, task: 'task_2', minute: 1),
      ];

      expect(pendingMarksOf(queue, 'task_2').single.itemId, 'i2');
    });
  });

  group('наложение неотправленных отметок на задание', () {
    test('экран показывает отметку и пересчитанный прогресс', () {
      final task = _task(items: [_item('i1'), _item('i2'), _item('i3')]);

      final applied = applyPendingMarks(task, [
        _mark('i1', AssemblyItemStatus.picked, picked: 10),
        _mark('i2', AssemblyItemStatus.partial, picked: 4, minute: 1),
      ]);

      expect(applied.items[0].status, AssemblyItemStatus.picked);
      expect(applied.items[0].pickedQuantity, 10);
      expect(applied.items[1].status, AssemblyItemStatus.partial);
      expect(applied.items[1].pickedQuantity, 4);
      expect(applied.items[2].status, AssemblyItemStatus.pending);
      // Прогресс и нехватка считаются заново — иначе «отмечено 0 из 3» врало бы.
      expect(applied.itemsMarked, 2);
      expect(applied.itemsShortage, 1);
    });

    test('отметки чужого задания игнорируются', () {
      final task = _task(items: [_item('i1')]);

      final applied = applyPendingMarks(task, [
        _mark('i1', AssemblyItemStatus.missing, task: 'task_2'),
      ]);

      expect(applied.items.single.status, AssemblyItemStatus.pending);
      expect(applied.itemsMarked, 0);
    });

    test('пустая очередь не трогает задание', () {
      final task = _task(items: [_item('i1')]);
      expect(applyPendingMarks(task, const []), same(task));
    });
  });

  group('сериализация отметки', () {
    test('запись переживает круг через хранилище', () {
      final mark = _mark('i1', AssemblyItemStatus.partial, picked: 3);
      final restored = PendingMark.fromJson(mark.toJson());

      expect(restored, isNotNull);
      expect(restored!.itemId, 'i1');
      expect(restored.status, AssemblyItemStatus.partial);
      expect(restored.pickedQuantity, 3);
      expect(restored.createdAt, mark.createdAt);
    });

    test('битая запись отбрасывается, а не роняет очередь', () {
      expect(PendingMark.fromJson('мусор'), isNull);
      expect(PendingMark.fromJson({'task_id': 'task_1'}), isNull);
      // Снять отметку нельзя — pending в очереди быть не может.
      expect(
        PendingMark.fromJson({
          'task_id': 'task_1',
          'item_id': 'i1',
          'status': 'pending',
          'picked_quantity': 0,
          'created_at': '2026-09-02T10:00:00.000',
        }),
        isNull,
      );
    });
  });
}
