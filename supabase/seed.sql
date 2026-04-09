alter table public.tasks disable row level security;

-- Tareas del Usuario A
insert into public.tasks (user_id, title, description, priority, status, position)
values
  ('8ee93bc2-914b-4190-82fa-4d543558db6b', 'Configurar Supabase',    'Setup inicial del proyecto',  'high',   'todo',        1),
  ('8ee93bc2-914b-4190-82fa-4d543558db6b', 'Crear componente Kanban','UI con drag and drop',        'high',   'in_progress', 2),
  ('8ee93bc2-914b-4190-82fa-4d543558db6b', 'Implementar RAG',        'Chat con contexto de tareas', 'medium', 'todo',        3);

-- Tareas del Usuario B
insert into public.tasks (user_id, title, description, priority, status, position)
values
  ('6912288f-30a7-46e4-9016-9440a1dc1582', 'Revisar documentacion',  'Leer docs de Next.js 15',     'low',    'todo',        1),
  ('6912288f-30a7-46e4-9016-9440a1dc1582', 'Preparar presentacion',  'Demo final del curso',        'high',   'in_progress', 2);

alter table public.tasks enable row level security;
