create table public.clubs (
    id              uuid primary key default gen_random_uuid(),
    admin_user_id   uuid references auth.users on delete cascade not null,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    club_name       text,
    meeting_room    text
);
comment on table public.clubs is 'All active bookclubs on the platform.';
