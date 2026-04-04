# Demo Users And Profiles

These are development-only credentials seeded by `springbackend/src/main/resources/db/migration/V3__additional_users.sql`.

## Login Credentials

| Email | Password | Username (`users.username`) |
|---|---|---|
| sarah@example.com | sarah123 | sarahchen |
| marcus@example.com | marcus123 | marcusj |
| priya@example.com | priya123 | priyap |
| alex@example.com | alex123 | alexr |

## Profiles Per User

| Username | Profile Slug (`user_profiles.profile_slug`) | Display Name |
|---|---|---|
| sarahchen | sarah-chen | Sarah Chen |
| marcusj | marcus-johnson | Marcus Johnson |
| priyap | priya-patel | Priya Patel |
| alexr | alex-rivera | Alex Rivera |

## Useful API Routes

- Public profile: `/api/profiles/:slug`
- Resume by profile: `/api/profiles/:slug/resume`
- Portfolio by profile: `/api/profiles/:slug/portfolio`
- Availability by profile: `/api/profiles/:slug/availability`
- Book meeting by profile: `/api/profiles/:slug/meetings`

Examples:

- `/api/profiles/sarah-chen`
- `/api/profiles/marcus-johnson`
- `/api/profiles/priya-patel`
- `/api/profiles/alex-rivera`

## BCrypt Hashes (Stored In DB)

| Email | BCrypt Hash |
|---|---|
| sarah@example.com | `$2a$10$LOTm5OiwXqIWEJ/KJP2TB.PI.DuUrUaMzDj9VeNnUfKcT19CAFczC` |
| marcus@example.com | `$2a$10$ZLDUIHLqB8f/a1WjcpMeT.FOLYsJ.YafBeuS027rYEWjvXK.oydw.` |
| priya@example.com | `$2a$10$.VbO6awjDjUwsKr6NgHpSOE79eJC.i9pTJUzlXWX.WBqig3qWXuhS` |
| alex@example.com | `$2a$10$h1TJr3Bb86VnXIPq2qBJBePNUuUfTttwcPgWl7N3YXKym4.9XyXY2` |

## Note

Use these accounts only in local/dev environments. Rotate or remove them before production deployment.
