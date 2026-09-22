# Магнолия: кадры для видео

Подготовлено для ЕС Клиники. Метод 02 — фотореалистичные CGI-изображения. Это не фотографии существующего дерева.

## Что внутри

Шесть оригинальных PNG с настоящим прозрачным фоном, каждый 1254 × 1254 пикселя:

1. `stages/01-seed.png` — семечко.
2. `stages/02-sprout.png` — росток.
3. `stages/03-sapling.png` — саженец.
4. `stages/04-young-tree.png` — молодое дерево.
5. `stages/05-buds.png` — дерево с бутонами.
6. `stages/06-bloom.png` — цветение.

Изображения созданы отдельными запросами ImageGen с финальным деревом в качестве референса. Ракурс и положение основания сохранены близко, но это не идеально совмещённые кадры одной 3D-модели. Разница нижней границы видимого объекта между кадрами — до 14 пикселей; форма ветвей и размер листвы могут немного меняться. Кадры не обрезаны и не растянуты после генерации.

## Как собрать пробу

Начните с пары 05 → 06: так проще проверить, удерживает ли выбранная видеомодель ствол и раскрывает ли цветы без дрожания. Если ваш инструмент поддерживает начальный и конечный кадры, задайте их этой парой. Затем создайте остальные четыре перехода. Конкретные доступные настройки зависят от выбранного вами инструмента; эти задания не требуют определённого интерфейса Gemini.

Предлагаемая длительность каждого перехода — 3–4 секунды. Общая длина после монтажа — около 15–20 секунд. Не вставляйте паузы или затухание в чёрный между переходами. Проверьте последний кадр каждого клипа рядом с первым кадром следующего.

Сначала сохраняйте общий размер холста и масштаб: маленькое семечко в начале намеренно находится внизу большого прозрачного поля. Увеличение семечка или отъезд камеры можно добавить позже, одинаковым управляемым движением на сайте.

## Общее задание для каждого перехода

> Locked-off camera, fixed lens, fixed framing, fixed lighting. A single photorealistic CGI magnolia tree grows continuously from the exact first reference into the exact last reference. Keep the trunk base fixed at the same bottom-centre position throughout. Preserve the identity and S-shaped trunk of this same tree. Use smooth, physically plausible botanical growth: lengthening stems, thickening branches, leaves gradually unfurling from their attachment points. No cuts, no dissolves, no crossfades between two separate objects, no camera orbit, no zoom, no sudden changes of scale. No new scenery, soil, pot, text, people, shadows on a floor, wind or floating particles. Delicate premium botanical visual, softly illuminated from upper left. Preserve fine leaf edges and twig detail. End exactly on the supplied final reference.

## Пять переходов

### 01 → 02: семечко раскрывается

> The brown seed shell gently splits. A tiny pale root emerges downward, then a slender living shoot curves upward. Two juvenile magnolia leaves slowly unfold. Keep all motion connected to the same seed. Do not enlarge the seed or replace it with a separate plant. Match the final seedling reference.

### 02 → 03: росток становится саженцем

> The young stem gradually lengthens and becomes a slender woody trunk with the characteristic gentle S curve. Three small primary branches emerge continuously. New leaves unfurl from the tips and alternate along the twigs. Preserve existing leaves and the fixed root position. No flowers yet. Match the final sapling reference.

### 03 → 04: развивается крона

> The same sapling grows taller and broader. The three primary limbs lengthen, finer secondary branches emerge, and new magnolia leaves unfold gradually along them. The trunk thickens continuously while retaining its S curve and major fork. Maintain airy gaps between leaf clusters. No flowers or buds. Match the young tree reference.

### 04 → 05: появляются бутоны

> The same tree develops its full mature crown. Branches extend organically, the trunk thickens slightly and green foliage becomes more abundant. Small closed magnolia buds gradually form at twig ends. Buds remain closed, showing only subtle ivory tips. Do not open flowers yet. Match the mature bud-stage reference.

### 05 → 06: цветение

> Keep the fully grown trunk, branches and leaves almost perfectly still and identical. Closed magnolia buds slowly swell and open into exquisite ivory blossoms with a faint warm blush near their centres. Petals unfurl from their bases in a gently staggered sequence across the crown. Flowers stay attached to their original twig positions. No new branches, no disappearing leaves, no sudden popping. Match the final blooming reference.

## Фон и прозрачность

Альфа-канал проверен у всех исходных PNG. Это не означает, что видеомодель экспортирует видео с альфа-каналом. Если прозрачный видеовывод недоступен, используйте однородный фон для последующего отделения или сразу фон будущего блока сайта. Не выбирайте зелёный хромакей: он конфликтует с листвой. Нейтральный цвет фона сайта в этой пробе — `#f5f1e7`.

Не просите модель нарисовать шахматную клетку: она должна оставаться только индикатором прозрачности в программе просмотра.

## Привязка к трём блокам сайта

- 01. Ваша личная медицинская команда — росток и формирование основы.
- 02. Экспертиза и лечение — развитие ветвей и кроны.
- 03. Когда ситуация сложная — раскрытие цветов и финальная крона.

Это визуальная метафора трёх направлений сопровождения, а не медицинское обещание или последовательность доступа к услугам.

Для прокрутки конечный ролик можно преобразовать в оптимизированную последовательность кадров и отображать кадр по позиции страницы. Сначала оцените тестовое видео: стабильность ствола, отсутствие скачков масштаба и аккуратность краёв важнее количества кадров. Мобильной версии понадобятся отдельный размер кадров, предварительная загрузка ближайших кадров и статичный вариант при сокращении движения.
