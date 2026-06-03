-- =====================================================================
-- seed.sql — sample data for the dyslexia learning app.
-- AUTO-GENERATED from db/lessons.data.js (npm run db:gen-sql). Do not edit by hand.
--
-- Run AFTER schema.sql, e.g.:   psql "$DATABASE_URL" -f db/schema.sql -f db/seed.sql
--
-- Notes:
--  * Re-runnable: clears lessons and re-inserts; users use guards.
--  * The teacher 'Ms. Perera' is inserted with NULL password_hash. On first
--    login the app accepts the invite code (TEACHER_PASSWORD env) and stores a
--    bcrypt hash automatically. To set a hash here instead, generate one with
--    bcrypt and replace NULL below.
-- =====================================================================

BEGIN;

-- Reset lessons so this script is repeatable.
DELETE FROM lessons;

-- ---- Lessons (15) ----
INSERT INTO lessons (title_en, title_si, type, difficulty, content) VALUES
  ('Animals Around Us', 'අප වටා සිටින සතුන්', 'picture_match', 1, '{"type":"picture_match","instructions_en":"Match the word to the picture","instructions_si":"වචනය පින්තූරයට ගලපන්න","items":[{"word_en":"cat","word_si":"පූසා","emoji":"🐱"},{"word_en":"dog","word_si":"බල්ලා","emoji":"🐶"},{"word_en":"fish","word_si":"මාළුවා","emoji":"🐟"},{"word_en":"bird","word_si":"කුරුල්ලා","emoji":"🐦"}]}'::jsonb),
  ('Fruits We Eat', 'අප කන පලතුරු', 'picture_match', 1, '{"type":"picture_match","instructions_en":"Match the word to the picture","instructions_si":"වචනය පින්තූරයට ගලපන්න","items":[{"word_en":"apple","word_si":"ඇපල්","emoji":"🍎"},{"word_en":"banana","word_si":"කෙසෙල්","emoji":"🍌"},{"word_en":"mango","word_si":"අඹ","emoji":"🥭"},{"word_en":"grapes","word_si":"මිදි","emoji":"🍇"}]}'::jsonb),
  ('My Body', 'මගේ ශරීරය', 'picture_match', 1, '{"type":"picture_match","instructions_en":"Match the word to the picture","instructions_si":"වචනය පින්තූරයට ගලපන්න","items":[{"word_en":"eye","word_si":"ඇස","emoji":"👁️"},{"word_en":"ear","word_si":"කන","emoji":"👂"},{"word_en":"nose","word_si":"නාසය","emoji":"👃"},{"word_en":"mouth","word_si":"කට","emoji":"👄"}]}'::jsonb),
  ('Things That Go', 'ගමන් කරන දේ', 'picture_match', 1, '{"type":"picture_match","instructions_en":"Match the word to the picture","instructions_si":"වචනය පින්තූරයට ගලපන්න","items":[{"word_en":"car","word_si":"කාර්","emoji":"🚗"},{"word_en":"bus","word_si":"බස්","emoji":"🚌"},{"word_en":"bicycle","word_si":"බයිසිකලය","emoji":"🚲"},{"word_en":"aeroplane","word_si":"ගුවන් යානය","emoji":"✈️"}]}'::jsonb),
  ('My First Reading', 'මගේ පළමු කියවීම', 'reading', 2, '{"type":"reading","instructions_en":"Tap the speaker to hear each sentence, then read it aloud.","instructions_si":"එක් එක් වාක්‍යය ඇසීමට ස්පීකරය තට්ටු කරන්න, පසුව එය හඬ නඟා කියවන්න.","sentences":[{"en":"The sun is big and yellow.","si":"හිරු විශාල හා කහ පැහැයි.","emoji":"☀️"},{"en":"A small dog runs in the park.","si":"කුඩා බල්ලෙක් උද්‍යානයේ දුවයි.","emoji":"🐶"},{"en":"I like to read my book.","si":"මම මගේ පොත කියවීමට කැමතියි.","emoji":"📖"}]}'::jsonb),
  ('Colours Quiz', 'වර්ණ ප්‍රශ්නාවලිය', 'quiz', 2, '{"type":"quiz","instructions_en":"Choose the correct picture.","instructions_si":"නිවැරදි පින්තූරය තෝරන්න.","questions":[{"prompt_en":"Which one is red?","prompt_si":"රතු පාට කුමක්ද?","options":[{"label_en":"apple","label_si":"ඇපල්","emoji":"🍎","correct":true},{"label_en":"leaf","label_si":"කොළය","emoji":"🍃","correct":false},{"label_en":"banana","label_si":"කෙසෙල්","emoji":"🍌","correct":false}],"hint_en":"It is a fruit you can eat.","hint_si":"එය ඔබට කන්න පුළුවන් පලතුරකි."},{"prompt_en":"Which one is yellow?","prompt_si":"කහ පාට කුමක්ද?","options":[{"label_en":"sun","label_si":"හිරු","emoji":"☀️","correct":true},{"label_en":"grapes","label_si":"මිදි","emoji":"🍇","correct":false},{"label_en":"fish","label_si":"මාළුවා","emoji":"🐟","correct":false}],"hint_en":"You see it in the sky in the day.","hint_si":"ඔබ එය දිවා කාලයේ අහසේ දකියි."}]}'::jsonb),
  ('Food on My Plate', 'මගේ පිඟානේ ආහාර', 'picture_match', 2, '{"type":"picture_match","instructions_en":"Match the word to the picture","instructions_si":"වචනය පින්තූරයට ගලපන්න","items":[{"word_en":"bread","word_si":"පාන්","emoji":"🍞"},{"word_en":"milk","word_si":"කිරි","emoji":"🥛"},{"word_en":"egg","word_si":"බිත්තරය","emoji":"🥚"},{"word_en":"carrot","word_si":"කැරට්","emoji":"🥕"}]}'::jsonb),
  ('At School', 'පාසලේදී', 'reading', 2, '{"type":"reading","instructions_en":"Tap the speaker to hear each sentence, then read it aloud.","instructions_si":"එක් එක් වාක්‍යය ඇසීමට ස්පීකරය තට්ටු කරන්න, පසුව එය හඬ නඟා කියවන්න.","sentences":[{"en":"I go to school every day.","si":"මම සෑම දිනකම පාසල් යමි.","emoji":"🏫"},{"en":"My teacher is very kind.","si":"මගේ ගුරුතුමිය ඉතා කරුණාවන්තයි.","emoji":"👩‍🏫"},{"en":"We sing a happy song.","si":"අපි සතුටු ගීතයක් ගයමු.","emoji":"🎵"}]}'::jsonb),
  ('Action Words', 'ක්‍රියා වචන', 'quiz', 3, '{"type":"quiz","instructions_en":"Pick the picture for the action word.","instructions_si":"ක්‍රියා වචනයට ගැළපෙන පින්තූරය තෝරන්න.","questions":[{"prompt_en":"run","prompt_si":"දුවනවා","options":[{"label_en":"running","label_si":"දුවනවා","emoji":"🏃","correct":true},{"label_en":"sleeping","label_si":"නිදනවා","emoji":"😴","correct":false},{"label_en":"eating","label_si":"කනවා","emoji":"🍽️","correct":false}],"hint_en":"You move your legs fast.","hint_si":"ඔබ ඔබේ කකුල් වේගයෙන් චලනය කරයි."},{"prompt_en":"eat","prompt_si":"කනවා","options":[{"label_en":"eating","label_si":"කනවා","emoji":"🍽️","correct":true},{"label_en":"jumping","label_si":"පනිනවා","emoji":"🤸","correct":false},{"label_en":"reading","label_si":"කියවනවා","emoji":"📖","correct":false}],"hint_en":"You do this when you are hungry.","hint_si":"ඔබ බඩගිනි වූ විට මෙය කරයි."}]}'::jsonb),
  ('My Day', 'මගේ දවස', 'reading', 3, '{"type":"reading","instructions_en":"Tap the speaker to hear each sentence, then read it aloud.","instructions_si":"එක් එක් වාක්‍යය ඇසීමට ස්පීකරය තට්ටු කරන්න, පසුව එය හඬ නඟා කියවන්න.","sentences":[{"en":"In the morning I brush my teeth.","si":"උදෑසන මම දත් මදිමි.","emoji":"🪥"},{"en":"I eat rice for lunch.","si":"දිවා ආහාරයට මම බත් කමි.","emoji":"🍚"},{"en":"At night I sleep in my warm bed.","si":"රාත්‍රියේ මම උණුසුම් ඇඳේ නිදමි.","emoji":"🛏️"}]}'::jsonb),
  ('Big and Small', 'ලොකු සහ පොඩි', 'quiz', 3, '{"type":"quiz","instructions_en":"Choose the correct picture.","instructions_si":"නිවැරදි පින්තූරය තෝරන්න.","questions":[{"prompt_en":"Which animal is big?","prompt_si":"ලොකු සතා කුමක්ද?","options":[{"label_en":"elephant","label_si":"අලියා","emoji":"🐘","correct":true},{"label_en":"ant","label_si":"කුහුඹුවා","emoji":"🐜","correct":false},{"label_en":"mouse","label_si":"මීයා","emoji":"🐭","correct":false}],"hint_en":"It has a long trunk.","hint_si":"එයට දිගු හොඬක් ඇත."},{"prompt_en":"Which one is small?","prompt_si":"පොඩි දේ කුමක්ද?","options":[{"label_en":"ant","label_si":"කුහුඹුවා","emoji":"🐜","correct":true},{"label_en":"elephant","label_si":"අලියා","emoji":"🐘","correct":false},{"label_en":"cow","label_si":"හරකා","emoji":"🐄","correct":false}],"hint_en":"It is tiny and lives in the ground.","hint_si":"එය ඉතා කුඩා වන අතර පොළොවේ ජීවත් වේ."}]}'::jsonb),
  ('The Little Garden', 'කුඩා වත්ත', 'reading', 4, '{"type":"reading","instructions_en":"Tap the speaker to hear each sentence, then read it aloud.","instructions_si":"එක් එක් වාක්‍යය ඇසීමට ස්පීකරය තට්ටු කරන්න, පසුව එය හඬ නඟා කියවන්න.","sentences":[{"en":"My grandmother has a small garden.","si":"මගේ ආච්චිට කුඩා වත්තක් ඇත.","emoji":"🌷"},{"en":"Red and pink flowers grow there.","si":"එහි රතු සහ රෝස මල් වැවේ.","emoji":"🌸"},{"en":"A yellow butterfly flies over them.","si":"කහ සමනලයෙක් ඒවා මතින් පියාසර කරයි.","emoji":"🦋"},{"en":"We water the plants together.","si":"අපි එකට ශාක වලට ජලය දමමු.","emoji":"💧"}]}'::jsonb),
  ('Where They Live', 'ඔවුන් ජීවත් වන තැන', 'quiz', 4, '{"type":"quiz","instructions_en":"Choose the correct picture.","instructions_si":"නිවැරදි පින්තූරය තෝරන්න.","questions":[{"prompt_en":"Which animal can fly?","prompt_si":"පියාසර කළ හැකි සතා කුමක්ද?","options":[{"label_en":"bird","label_si":"කුරුල්ලා","emoji":"🐦","correct":true},{"label_en":"fish","label_si":"මාළුවා","emoji":"🐟","correct":false},{"label_en":"dog","label_si":"බල්ලා","emoji":"🐶","correct":false}],"hint_en":"It has wings and a beak.","hint_si":"එයට පියාපත් සහ හොටක් ඇත."},{"prompt_en":"Which animal lives in water?","prompt_si":"ජලයේ ජීවත් වන සතා කුමක්ද?","options":[{"label_en":"fish","label_si":"මාළුවා","emoji":"🐟","correct":true},{"label_en":"cat","label_si":"පූසා","emoji":"🐱","correct":false},{"label_en":"bird","label_si":"කුරුල්ලා","emoji":"🐦","correct":false}],"hint_en":"It swims and has fins.","hint_si":"එය පිහිනන අතර වරල් ඇත."}]}'::jsonb),
  ('A Day at the Beach', 'වෙරළේ දිනයක්', 'reading', 5, '{"type":"reading","instructions_en":"Tap the speaker to hear each sentence, then read it aloud.","instructions_si":"එක් එක් වාක්‍යය ඇසීමට ස්පීකරය තට්ටු කරන්න, පසුව එය හඬ නඟා කියවන්න.","sentences":[{"en":"On Sunday we went to the beach.","si":"ඉරිදා අපි වෙරළට ගියෙමු.","emoji":"🏖️"},{"en":"The waves were blue and cool.","si":"රළ නිල් සහ සිසිල් විය.","emoji":"🌊"},{"en":"I built a big sandcastle.","si":"මම විශාල වැලි බලකොටුවක් තැනුවෙමි.","emoji":"🏰"},{"en":"We ate ice cream and laughed.","si":"අපි අයිස්ක්‍රීම් කා සිනාසුණෙමු.","emoji":"🍦"}]}'::jsonb),
  ('Story Time', 'කතන්දර වේලාව', 'quiz', 5, '{"type":"quiz","instructions_en":"Read: \"Nimal has a red ball. He plays with his dog in the garden.\" Now answer.","instructions_si":"කියවන්න: \"නිමල්ට රතු බෝලයක් ඇත. ඔහු වත්තේදී ඔහුගේ බල්ලා සමඟ සෙල්ලම් කරයි.\" දැන් පිළිතුරු දෙන්න.","questions":[{"prompt_en":"What does Nimal have?","prompt_si":"නිමල්ට ඇත්තේ කුමක්ද?","options":[{"label_en":"a ball","label_si":"බෝලයක්","emoji":"⚽","correct":true},{"label_en":"a book","label_si":"පොතක්","emoji":"📖","correct":false},{"label_en":"a kite","label_si":"සරුංගලයක්","emoji":"🪁","correct":false}],"hint_en":"It is red and you can play with it.","hint_si":"එය රතු වන අතර ඔබට එය සමඟ සෙල්ලම් කළ හැක."},{"prompt_en":"Who plays with Nimal?","prompt_si":"නිමල් සමඟ සෙල්ලම් කරන්නේ කවුද?","options":[{"label_en":"his dog","label_si":"ඔහුගේ බල්ලා","emoji":"🐶","correct":true},{"label_en":"a cat","label_si":"පූසෙක්","emoji":"🐱","correct":false},{"label_en":"a bird","label_si":"කුරුල්ලෙක්","emoji":"🐦","correct":false}],"hint_en":"It is a pet that barks.","hint_si":"එය බුරන සුරතලෙකි."}]}'::jsonb);

-- ---- Demo teacher (password set on first login via invite code) ----
INSERT INTO users (name, role, language, password_hash)
SELECT 'Ms. Perera', 'teacher', 'en', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE LOWER(name) = LOWER('Ms. Perera') AND role = 'teacher'
);

-- ---- Demo students ----
INSERT INTO users (name, role, language, grade)
SELECT 'Nimal', 'student', 'si', 3
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE LOWER(name) = LOWER('Nimal') AND role = 'student'
);
INSERT INTO users (name, role, language, grade)
SELECT 'Amara', 'student', 'en', 4
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE LOWER(name) = LOWER('Amara') AND role = 'student'
);
INSERT INTO users (name, role, language, grade)
SELECT 'Kavya', 'student', 'si', 2
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE LOWER(name) = LOWER('Kavya') AND role = 'student'
);

COMMIT;
