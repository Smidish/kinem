alter table public.comments drop constraint if exists comments_question_check;
alter table public.comments add constraint comments_question_check check (question in (
  'kinem-question-1', 'kinem-question-2', 'kinem-question-3', 'kinem-question-4',
  'kinem-show-ich-sehe-was', 'kinem-show-bodenlos', 'kinem-show-macken',
  'kinem-show-formlos', 'kinem-show-trinkhalle', 'kinem-philosophie'
));
