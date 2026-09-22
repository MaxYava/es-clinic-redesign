# Магнолия — новая фотосерия для видео

Шесть фотореалистичных изображений созданы встроенным ImageGen. Размер каждого — 1254 × 1254; у каждого есть настоящий альфа-канал. Это сгенерированная серия, не съёмка одного существующего дерева.

## Кадры

1. `01-seed.png` — целое закрытое семечко с естественной фактурой.
2. `02-sprout.png` — росток с молодыми листьями и остатками оболочки.
3. `03-sapling.png` — саженец с первыми боковыми побегами.
4. `04-young-tree.png` — молодая магнолия с развивающейся кроной.
5. `05-buds.png` — взрослое дерево с закрытыми бутонами.
6. `06-bloom.png` — цветение.

Для стадии 05 использован финальный кадр 06: раскрытые цветы заменены небольшими опушёнными бутонами. Остальные стадии создавались с референсами этой же серии. Точные запросы находятся в `PROMPTS.md`; проверенные размеры и границы — в `VALIDATION.json`. Исходные PNG сохранены без последующей ретуши или масштабирования.

## Сначала проверить цветение

В режиме с начальным и конечным кадром загрузите `05-buds.png` и `06-bloom.png`. Для первой пробы достаточно 4–6 секунд. Сначала оцените сохранение ствола, ветвей и ракурса, затем переходите к остальным четырём парам. Подборка сервисов и официальные инструкции находятся в `VIDEO-TOOLS.md`.

Для этой пары:

> One continuous locked-off botanical shot. The first and final images depict the same real-looking magnolia immediately before and during flowering. Preserve the exact trunk, root collar, branch positions, leaf arrangement, camera, framing and soft overcast lighting. Only the closed buds change: their outer scales gently part and ivory petals gradually unfurl from their bases. Slightly stagger the opening across the tree. Flowers remain attached to their original twigs. No new branches, no camera movement, no dissolve, no crossfade, no melting bark and no flickering foliage. End on the supplied final image.

## Общее задание для остальных переходов

> A single real-looking Magnolia grandiflora grows continuously from the supplied first frame into the supplied final frame. Documentary botanical photography, natural imperfect leaves, authentic bark texture and soft overcast daylight from upper left. Fixed camera and lens. Keep the base of the plant at one stable bottom-centre point. Stems lengthen from their living tips, new side shoots branch from existing stems, leaves unfurl gradually and the trunk thickens. Preserve the natural upright trunk and the developing three main limbs. No CGI or illustration aesthetic. No cuts, crossfades, dissolving between unrelated plants, camera orbit, wind, sudden scale jumps, soil, pot, scenery, captions or extra objects. Settle on the supplied final frame.

Добавьте к общему заданию текст нужного перехода:

### 01 → 02

> The intact dark brown seed gradually opens. A delicate green shoot emerges from the same seed and rises, while the seed coat separates into small curled pieces around its base. The first two young leaves unfold, followed by one small true leaf. Keep the seed connected to the growing plant. Do not create a long exposed white root, a separate seedling or a second seed. Match the final seedling image.

### 02 → 03

> The seedling's stem grows taller and gradually becomes a slender young woody stem. The empty seed coat recedes naturally as the root collar develops. Small side shoots emerge in the future directions of the three main branches. New magnolia leaves unfold along the existing stem and shoots. No flower buds yet. Match the final sapling image.

### 03 → 04

> The three early limbs lengthen and thicken naturally. Unequal secondary branches develop and new leaves unfold at varied angles. The crown becomes wider and fuller, retaining visible gaps and the original branching directions. Bark matures gradually. No flowers or flower buds. Match the final young tree image.

### 04 → 05

> The same young magnolia develops its full adult crown. The existing trunk and limbs thicken gradually, twigs extend and foliage fills out without changing the tree's identity. Small softly hairy tapered flower buds form at the positions visible in the final reference. The buds stay closed. Do not cover every twig with buds and do not open petals yet.

## Совмещение и масштаб

У кадров одинаковый холст, но генерация не обеспечивает точное совпадение всех пикселей. Нижняя граница объекта находится на строках 1188, 1184, 1219, 1213, 1198 и 1196 соответственно; общий разброс — 35 пикселей (2,8% высоты). У пары 05 → 06 разница — 2 пикселя. В таблице указана граница при альфа-значении выше 128, а не анатомическая точка на коре.

| Кадр | Сдвиг по вертикали для общей нижней границы y=1196 |
| --- | ---: |
| 01 | +8 px |
| 02 | +12 px |
| 03 | −23 px |
| 04 | −17 px |
| 05 | −2 px |
| 06 | 0 px |

Эти сдвиги можно применить в редакторе перед видеогенерацией, если заметен скачок основания. Самим PNG они не применены. Размер семечка и темп изменения масштабов выбраны для читаемой визуальной истории; переходы требуют проверки на пробном видео. Между отдельно сгенерированными стадиями также возможны небольшие различия мелких ветвей и листьев.

## Фон

Прозрачность входного PNG не означает прозрачность выходного видео. Если видеосервис не сохраняет альфа-канал, для этой страницы можно использовать однотонный фон `#f5f1e7`. Не рисуйте шахматную сетку в кадре. Зелёный хромакей неудобен для зелёной листвы.

После удачной пробы создайте остальные переходы и соедините их без затемнений между стадиями. Первое и последнее изображения каждого отрезка должны совпадать с соседними. Для привязки к прокрутке можно использовать полученный ролик или последовательность его кадров.

## Ботанические ориентиры

В образе семечка использовано состояние после удаления красной наружной мякоти, описанное в [материале Oklahoma State University](https://extension.okstate.edu/announcements/horticulture-tips/hort-tips-october-2024). Фактура закрытых бутонов и коры ориентирована на [описание магнолии в WashU Arboretum](https://trees.wustl.edu/items/63/). Эти источники использованы для уточнения визуальных деталей.
