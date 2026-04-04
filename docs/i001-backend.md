# Backend Architecture & API Documentation

## Application Context

This Linktree clone is a personal hub application that allows users to create professional profiles with resume information, portfolio projects, and scheduling capabilities. The frontend supports theme switching between a modern creative theme and a professional academia theme.

### Key Features
- **User Authentication**: Registration, login, profile management
- **Dynamic Profiles**: Users can customize their bio, links, and appearance
- **Resume Management**: Add/edit work experience, education, skills
- **Portfolio Management**: Create and manage project showcases
- **Calendar Integration**: Schedule meetings with availability management
- **Theme Preferences**: Save user's preferred theme (creative/academia)

---

## Database Schema

This version reduces table count and keeps most user-managed content in one flexible structure.

### Design Goals
- Keep core identity and auth strict (`users`, `user_profiles`).
- Store resume, portfolio, skills, and custom entries in one generic table.
- Avoid over-modeling early; use categories and simple fields first.
- Keep scheduling simple by removing `meeting_types` and using enum + duration in bookings.
- Use slug-based ownership (`user_slug`) for readability and simpler API mapping.
- Let one user own multiple public profiles, each identified by its own `profile_slug`.

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    theme_preference VARCHAR(20) DEFAULT 'default',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Profiles Table
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_slug VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    title VARCHAR(200),
    details JSONB DEFAULT '[]'::jsonb,
    -- Array of generic profile details.
    -- If `link` is null, the entry is plain text rather than a clickable URL.
    -- Example:
    -- [
    --   {"header":"links", "value":"https://github.com/johndoe", "link":"https://github.com/johndoe"},
    --   {"header":"contact", "value":"+1 555 123 4567", "link":null},
    --   {"header":"location", "value":"San Francisco, CA", "link":null}
    -- ]
    is_public BOOLEAN DEFAULT true,
    profile_slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Profile Items Table (Generic Content)
```sql
CREATE TABLE profile_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_slug VARCHAR(50) NOT NULL REFERENCES user_profiles(profile_slug) ON DELETE CASCADE,
    category VARCHAR(40) NOT NULL,
    -- Suggested values:
    -- 'experience', 'education', 'skill', 'project', 'link', 'award', 'certification', 'other'
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(200),
    year VARCHAR(30),
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Optional extensibility for image/link/color/proficiency/etc.
    -- Example: {"url":"https://...", "image_url":"https://...", "proficiency":4, "featured":true}
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'draft', 'archived'
    sort_order INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Calendar Availability Table
```sql
CREATE TABLE calendar_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_slug VARCHAR(50) NOT NULL REFERENCES user_profiles(profile_slug) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Meeting Bookings Table (No Meeting Types Table)
```sql
CREATE TABLE meeting_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_slug VARCHAR(50) NOT NULL REFERENCES user_profiles(profile_slug) ON DELETE CASCADE,
    meeting_kind VARCHAR(20) NOT NULL,
    -- 'coffee_chat', 'interview', 'demo', 'mentoring', 'custom'
    attendee_name VARCHAR(200) NOT NULL,
    attendee_email VARCHAR(255) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    message TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    -- Optional: {"location":"Google Meet", "project_id":"uuid", "notes":"..."}
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'cancelled', 'completed'
    calendar_event_id VARCHAR(200), -- External calendar system ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe"
}

Response: 201 Created
{
    "user": {
        "id": "uuid",
        "email": "user@example.com",
        "username": "johndoe",
        "first_name": "John",
        "last_name": "Doe"
    },
    "token": "jwt_token_here"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword"
}

Response: 200 OK
{
    "user": { /* user object */ },
    "token": "jwt_token_here"
}
```

#### Refresh Token
```
POST /api/auth/refresh
Authorization: Bearer <refresh_token>

Response: 200 OK
{
    "token": "new_jwt_token_here"
}
```

### User Profile Endpoints

#### Create User Profile
```
POST /api/profiles
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "profile_slug": "john-doe-academia",
    "display_name": "John Doe",
    "title": "Research Engineer",
    "details": [
        {
            "header": "links",
            "value": "https://github.com/johndoe",
            "link": "https://github.com/johndoe"
        },
        {
            "header": "contact",
            "value": "+1 555 123 4567",
            "link": null
        },
        {
            "header": "location",
            "value": "San Francisco, CA",
            "link": null
        }
    ]
}

Response: 201 Created
{
    "profile": { /* created profile object */ }
}
```

#### List User Profiles
```
GET /api/users/:username/profiles

Response: 200 OK
{
    "profiles": [
        {
            "profile_slug": "john-doe-academia",
            "display_name": "John Doe",
            "title": "Research Engineer"
        },
        {
            "profile_slug": "john-doe-creative",
            "display_name": "John Doe",
            "title": "Creative Technologist"
        }
    ]
}
```

#### Get User Profile
```
GET /api/profiles/:slug

Response: 200 OK
{
    "profile": {
        "id": "uuid",
        "profile_slug": "john-doe-academia",
        "user_slug": "johndoe",
        "display_name": "John Doe",
        "title": "Full Stack Developer",
        "bio": "Building digital experiences...",
        "avatar_url": "https://...",
        "theme_preference": "academia",
        "details": [
            {
                "header": "links",
                "value": "https://linkedin.com/in/johndoe",
                "link": "https://linkedin.com/in/johndoe"
            },
            {
                "header": "links",
                "value": "https://johndoe.com",
                "link": "https://johndoe.com"
            },
            {
                "header": "location",
                "value": "San Francisco, CA",
                "link": null
            },
            {
                "header": "contact",
                "value": "+1 555 123 4567",
                "link": null
            }
        ],
        "items": [
            {
                "id": "uuid",
                "category": "link",
                "title": "My Blog",
                "subtitle": "Personal Writing",
                "year": "",
                "description": "Long-form articles about engineering.",
                "metadata": {
                    "url": "https://blog.johndoe.com",
                    "icon": "note"
                },
                "sort_order": 1
            }
        ]
    }
}
```

#### Update User Profile
```
PUT /api/profiles/:slug
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "display_name": "John Doe",
    "title": "Senior Full Stack Developer",
    "bio": "Updated bio...",
    "theme_preference": "default",
    "details": [
        {
            "header": "links",
            "value": "https://linkedin.com/in/johndoe",
            "link": "https://linkedin.com/in/johndoe"
        },
        {
            "header": "links",
            "value": "https://custom-domain.com",
            "link": "https://custom-domain.com"
        },
        {
            "header": "contact",
            "value": "+1 555 123 4567",
            "link": null
        }
    ]
}

Response: 200 OK
{
    "profile": { /* updated profile object */ }
}
```

### Resume Endpoints

#### Get User Resume
```
GET /api/profiles/:slug/resume

Response: 200 OK
{
    "resume": {
        "items": [
            {
                "id": "uuid",
                "category": "experience",
                "title": "TechCorp Inc.",
                "subtitle": "Senior Developer",
                "year": "2021-Present",
                "description": "Led development of internal platform services.",
                "metadata": {
                    "location": "San Francisco, CA"
                },
                "sort_order": 0
            },
            {
                "id": "uuid",
                "category": "education",
                "title": "University of California",
                "subtitle": "B.S. Computer Science",
                "year": "2014-2018",
                "description": "Graduated with honors.",
                "metadata": {
                    "gpa": "3.8"
                }
            },
            {
                "id": "uuid",
                "category": "skill",
                "title": "JavaScript",
                "subtitle": "Programming",
                "year": "",
                "description": "Daily production usage.",
                "metadata": {
                    "proficiency": 5
                }
            }
        ]
    }
}
```

#### Add Resume Item
```
POST /api/users/items
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "category": "education",
    "title": "Stanford University",
    "subtitle": "M.S. Computer Science",
    "year": "2024",
    "description": "Focus on distributed systems.",
    "metadata": {
        "gpa": "3.9"
    }
}

Response: 201 Created
{
    "item": { /* created item object */ }
}
```

### Portfolio Endpoints

#### Get User Portfolio
```
GET /api/profiles/:slug/portfolio

Response: 200 OK
{
    "items": [
        {
            "id": "uuid",
            "category": "project",
            "title": "E-Commerce Platform",
            "subtitle": "Full-stack web app",
            "year": "2025",
            "description": "React + Node platform with integrated checkout.",
            "metadata": {
                "live_url": "https://demo.example.com",
                "github_url": "https://github.com/user/project",
                "technologies": ["React", "Node.js", "PostgreSQL"],
                "featured": true
            }
        }
    ]
}
```

#### Create Portfolio Project
```
POST /api/users/items
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "category": "project",
    "title": "New Project",
    "subtitle": "Portfolio Showcase",
    "year": "2026",
    "description": "Project description...",
    "metadata": {
        "image_url": "https://...",
        "live_url": "https://project.com",
        "github_url": "https://github.com/user/project",
        "technologies": ["Vue.js", "Python", "MongoDB"],
        "featured": false
    }
}

Response: 201 Created
{
    "item": { /* created item object */ }
}
```

### Calendar & Scheduling Endpoints

#### Get User Availability
```
GET /api/profiles/:slug/availability

Response: 200 OK
{
    "availability": [
        {
            "day_of_week": 1,
            "start_time": "09:00:00",
            "end_time": "17:00:00",
            "timezone": "America/Los_Angeles"
        }
    ]
}
```

#### Get Available Time Slots
```
GET /api/profiles/:slug/availability/slots?date=2024-01-15&duration=30&meeting_kind=coffee_chat

Response: 200 OK
{
    "available_slots": [
        {
            "start_time": "09:00:00",
            "end_time": "09:30:00",
            "timezone": "America/Los_Angeles"
        },
        {
            "start_time": "10:00:00",
            "end_time": "10:30:00",
            "timezone": "America/Los_Angeles"
        }
    ]
}
```

#### Book Meeting
```
POST /api/profiles/:slug/meetings
Content-Type: application/json

{
    "meeting_kind": "coffee_chat",
    "duration_minutes": 30,
    "attendee_name": "Jane Smith",
    "attendee_email": "jane@example.com",
    "scheduled_date": "2024-01-15",
    "scheduled_time": "09:00:00",
    "timezone": "America/Los_Angeles",
    "message": "Looking forward to our chat about the project."
}

Response: 201 Created
{
    "booking": {
        "id": "uuid",
        "confirmation_code": "ABC123",
        "meeting_details": {
            "meeting_kind": "coffee_chat",
            "date": "2024-01-15",
            "time": "09:00:00",
            "duration": 30,
            "timezone": "America/Los_Angeles"
        },
        "calendar_link": "https://calendar.google.com/calendar/event?..."
    }
}
```

#### Cancel Meeting
```
DELETE /api/meetings/:booking_id
or
PATCH /api/meetings/:booking_id
Content-Type: application/json

{
    "status": "cancelled",
    "cancellation_reason": "Schedule conflict"
}

Response: 200 OK
{
    "message": "Meeting cancelled successfully"
}
```

---

## Calendar Integration

### Google Calendar Integration

#### Setup Requirements
1. **Google Cloud Console Setup**
   - Create project
   - Enable Google Calendar API
   - Create OAuth 2.0 credentials
   - Set up service account for server-to-server auth

2. **OAuth Flow for User Calendar Access**
```javascript
// Example OAuth flow initiation
GET https://accounts.google.com/o/oauth2/auth?
  client_id=your_client_id&
  redirect_uri=your_redirect_uri&
  scope=https://www.googleapis.com/auth/calendar&
  response_type=code&
  access_type=offline
```

3. **Create Calendar Events**
```javascript
// Example API call to create event
POST https://www.googleapis.com/calendar/v3/calendars/primary/events
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "summary": "Meeting with Jane Smith",
  "description": "Project discussion meeting",
  "start": {
    "dateTime": "2024-01-15T09:00:00-08:00",
    "timeZone": "America/Los_Angeles"
  },
  "end": {
    "dateTime": "2024-01-15T09:30:00-08:00",
    "timeZone": "America/Los_Angeles"
  },
  "attendees": [
    {"email": "jane@example.com"}
  ],
  "conferenceData": {
    "createRequest": {
      "requestId": "unique-meeting-id",
      "conferenceSolutionKey": {
        "type": "hangoutsMeet"
      }
    }
  }
}
```

### Alternative Calendar Solutions

#### CalDAV Integration
- Works with Apple Calendar, Outlook, Thunderbird
- Standard protocol for calendar access
- Good for self-hosted solutions

#### Calendly-like Custom Solution
- Build your own scheduling engine
- Full control over features and data
- Integrate with multiple calendar providers

---

## Authentication & Security

### JWT Token Structure
```json
{
    "sub": "user_slug",
  "email": "user@example.com",
  "username": "johndoe",
  "iat": 1640995200,
  "exp": 1641081600,
  "scope": ["profile:read", "profile:write", "calendar:manage"]
}
```

### Security Best Practices
1. **Password Hashing**: Use bcrypt or Argon2
2. **Rate Limiting**: Implement per-endpoint rate limits
3. **CORS**: Configure properly for frontend domain
4. **Input Validation**: Validate all input data
5. **SQL Injection**: Use parameterized queries
6. **File Uploads**: Validate and scan uploaded files
7. **HTTPS Only**: Force HTTPS in production

### Role-Based Access Control (RBAC)
```sql
-- Optional: If you want admin functionality
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE user_roles (
    user_slug VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_slug, role_id)
);

-- Default roles: 'user', 'admin', 'premium'
```

---

## Email Notifications

### Email Templates Needed
1. **Welcome Email** - User registration
2. **Email Verification** - Account verification
3. **Meeting Confirmation** - Booking confirmation
4. **Meeting Reminder** - 24h and 1h before meeting
5. **Meeting Cancellation** - When meeting is cancelled
6. **Password Reset** - Forgot password flow

### Email Services
- **SendGrid** (Recommended)
- **Mailgun**
- **Amazon SES**
- **Postmark**

### Example Email Integration
```javascript
// Meeting confirmation email
const sendMeetingConfirmation = async (booking) => {
  await emailService.send({
    to: booking.attendee_email,
    template: 'meeting_confirmation',
    data: {
      attendee_name: booking.attendee_name,
      host_name: booking.user.display_name,
      meeting_date: booking.scheduled_date,
      meeting_time: booking.scheduled_time,
      duration: booking.duration,
      meeting_link: booking.meeting_link,
      cancellation_link: `${BASE_URL}/cancel/${booking.id}`
    }
  });
};
```

---

## File Storage & CDN

### Profile Pictures & Project Images
- **AWS S3** + CloudFront
- **Cloudinary** (Image optimization)
- **Google Cloud Storage**
- **Azure Blob Storage**

### File Upload API
```
POST /api/upload/avatar
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Response: 200 OK
{
    "url": "https://cdn.example.com/avatars/uuid.jpg",
    "thumbnail_url": "https://cdn.example.com/avatars/uuid_thumb.jpg"
}
```

---

## Deployment Considerations

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/linktree_db

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Google Calendar
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service
SENDGRID_API_KEY=your-sendgrid-key

# File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name

# App URLs
FRONTEND_URL=https://yourapp.com
BACKEND_URL=https://api.yourapp.com
```

### Database Migrations
Create migration scripts for:
1. Initial schema creation
2. Seed data (optional item categories enum/check constraint values)
3. Indexes for performance
4. Foreign key constraints

### Performance Optimizations
1. **Database Indexing**
   ```sql
   CREATE INDEX idx_users_username ON users(username);
   CREATE INDEX idx_profiles_slug ON user_profiles(profile_slug);
    CREATE INDEX idx_items_slug_category ON profile_items(user_slug, category);
    CREATE INDEX idx_items_slug_sort ON profile_items(user_slug, sort_order);
    CREATE INDEX idx_bookings_slug_date ON meeting_bookings(user_slug, scheduled_date);
   ```

2. **Caching Strategy**
   - Redis for session storage
   - Cache frequently accessed profiles
   - Cache availability calculations

3. **Rate Limiting**
   ```javascript
   // Example rate limiting
   app.use('/api/auth', rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5 // limit each IP to 5 requests per windowMs
   }));
   ```

---

## Testing Strategy

### Unit Tests
- Authentication functions
- User profile details array validation (`header`, `value`, optional `link`)
- Generic profile item model validation (`title`, `subtitle`, `year`, `description`, `category`)
- Calendar integration functions
- Email service functions

### Integration Tests
- API endpoints
- Database operations
- Third-party service integrations

### End-to-End Tests
- User registration flow
- Profile creation and editing
- Meeting booking flow
- Calendar synchronization

---

This documentation provides a comprehensive foundation for building the backend of your Linktree clone. The architecture supports multi-user functionality, robust calendar integration, and scalable deployment options.