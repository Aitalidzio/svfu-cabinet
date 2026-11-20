# Переводы на проверку

Якутский перевод делает ИИ, а проверяет Айтал. Английский проверяем по ходу.
Файл: `src/i18n/dictionaries/sah.json`. Проверенную строку вычёркиваем: `~~ключ~~`.

## Решение капитана (21.11.2026)

- **СВФУ**, не «ХИФУ» — в `app.tagline` и везде оставляем аббревиатуру СВФУ.
- Ранее проверенные ключи (nav, greeting, profile.student и т. д.) — ок.
- `Расписание` / `Профиль` — заимствования оставляем.

## Доперевод 21.11.2026 — нужно вычитать

Переведены блоки, которые ещё были по-русски: `meta`, `concept`, `login.*`, `profile.*`, `today.*`, `pages.*`, `schedule.*`, `grades.*` (подсказки и сводка), `requests.*` (+ staff), `notifications.*`, `announcements.*`, `scheduleChanges.*`, `notFound.text`, `nav.announcements*` / `nav.changes*`.

Осознанно совпадают с русским (заимствования / цифры / СВФУ): `app.name`, `app.tagline`, `nav.schedule`, `nav.profile`, `login.loginLabel`, `login.passwordLabel`, `schedule.kinds.lecture|practice`, `grades.control.credit|exam`, номера экземпляров и т. п.

Проверь в первую очередь на `/sah/login` и сценарии студента/сотрудника:
- ошибки входа (`login.errors.*`);
- длинные `grades.hint.*` и `grades.summary.*`;
- статусы заявок (`requests.statuses.*`, `statusText.*`);
- короткие вкладки `announcementsShort` / `changesShort` на 360 px (цель ~11 букв).

Также в `src/app/global-not-found.tsx` есть строка «Сирэй көстүбэтэ».

Ограничение по длине: подписи вкладок нижней панели (`nav.today`, `nav.schedule`, `nav.gradesShort`, `nav.requestsShort`, `nav.profile`) должны укладываться примерно в 66 px при размере шрифта 11 px — это около 11 букв.
