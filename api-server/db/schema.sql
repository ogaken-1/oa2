create extension "uuid-ossp" with schema public;

create table public.users (
  id uuid
    default uuid_generate_v4()
    not null
    primary key,
  email text not null unique
);

create table public.works (
  id uuid
    default uuid_generate_v4()
    not null
    primary key,
  start_ts timestamptz
    default now()
    not null,
  end_ts timestamptz,
  user_id uuid not null
    references public.users (id)
    on delete restrict
);

create table public.migrations (
  id text not null primary key
);

-- vim:tw=80 sw=2 ts=2 et cc=80
