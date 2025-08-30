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

## Technology Stack Recommendations

### Backend Framework Options
1. **Node.js + Express** (JavaScript/TypeScript)
2. **Python + FastAPI** (Python)
3. **Ruby on Rails** (Ruby)
4. **ASP.NET Core** (C#)

### Database Options
1. **PostgreSQL** (Recommended for complex relationships)
2. **MongoDB** (Good for flexible document storage)
3. **MySQL** (Traditional relational database)

### Calendar Integration
- **Google Calendar API**
- **Microsoft Graph API (Outlook)**
- **CalDAV Protocol**
- **Custom calendar solution**

---

## Database Schema

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
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    title VARCHAR(200),
    location VARCHAR(100),
    phone VARCHAR(20),
    website VARCHAR(200),
    linkedin_url VARCHAR(200),
    github_url VARCHAR(200),
    twitter_url VARCHAR(200),
    custom_domain VARCHAR(100) UNIQUE,
    is_public BOOLEAN DEFAULT true,
    profile_slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Work Experience Table
```sql
CREATE TABLE work_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    position VARCHAR(200) NOT NULL,
    location VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Education Table
```sql
CREATE TABLE education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    institution_name VARCHAR(200) NOT NULL,
    degree VARCHAR(200) NOT NULL,
    field_of_study VARCHAR(200),
    start_date DATE NOT NULL,
    end_date DATE,
    gpa DECIMAL(3,2),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Skills Table
```sql
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- e.g., 'programming', 'design', 'languages'
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Portfolio Projects Table
```sql
CREATE TABLE portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    live_url VARCHAR(500),
    github_url VARCHAR(500),
    technologies JSON, -- Array of technology names
    featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'published', -- 'draft', 'published', 'archived'
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Custom Links Table
```sql
CREATE TABLE custom_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    icon VARCHAR(50), -- Icon name or emoji
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Calendar Availability Table
```sql
CREATE TABLE calendar_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Meeting Types Table
```sql
CREATE TABLE meeting_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- duration in minutes
    color VARCHAR(7), -- hex color code
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Meeting Bookings Table
```sql
CREATE TABLE meeting_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    meeting_type_id UUID REFERENCES meeting_types(id) ON DELETE CASCADE,
    attendee_name VARCHAR(200) NOT NULL,
    attendee_email VARCHAR(255) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    duration INTEGER NOT NULL,
    message TEXT,
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

#### Get User Profile
```
GET /api/users/:username
or
GET /api/profiles/:slug

Response: 200 OK
{
    "profile": {
        "id": "uuid",
        "display_name": "John Doe",
        "title": "Full Stack Developer",
        "bio": "Building digital experiences...",
        "avatar_url": "https://...",
        "theme_preference": "academia",
        "social_links": {
            "linkedin": "https://linkedin.com/in/johndoe",
            "github": "https://github.com/johndoe",
            "twitter": "https://twitter.com/johndoe"
        },
        "custom_links": [
            {
                "id": "uuid",
                "title": "My Blog",
                "url": "https://blog.johndoe.com",
                "icon": "📝",
                "sort_order": 1
            }
        ]
    }
}
```

#### Update User Profile
```
PUT /api/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "display_name": "John Doe",
    "title": "Senior Full Stack Developer",
    "bio": "Updated bio...",
    "theme_preference": "default",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "github_url": "https://github.com/johndoe"
}

Response: 200 OK
{
    "profile": { /* updated profile object */ }
}
```

### Resume Endpoints

#### Get User Resume
```
GET /api/users/:username/resume

Response: 200 OK
{
    "resume": {
        "work_experiences": [
            {
                "id": "uuid",
                "company_name": "TechCorp Inc.",
                "position": "Senior Developer",
                "start_date": "2021-01-01",
                "end_date": null,
                "is_current": true,
                "description": "Led development of...",
                "sort_order": 0
            }
        ],
        "education": [
            {
                "id": "uuid",
                "institution_name": "University of California",
                "degree": "Bachelor of Science",
                "field_of_study": "Computer Science",
                "start_date": "2014-09-01",
                "end_date": "2018-06-01",
                "gpa": 3.8
            }
        ],
        "skills": [
            {
                "id": "uuid",
                "name": "JavaScript",
                "category": "programming",
                "proficiency_level": 5
            }
        ]
    }
}
```

#### Add Work Experience
```
POST /api/users/resume/experience
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "company_name": "New Company",
    "position": "Developer",
    "location": "San Francisco, CA",
    "start_date": "2023-01-01",
    "is_current": true,
    "description": "Working on exciting projects..."
}

Response: 201 Created
{
    "experience": { /* created experience object */ }
}
```

### Portfolio Endpoints

#### Get User Portfolio
```
GET /api/users/:username/portfolio

Response: 200 OK
{
    "projects": [
        {
            "id": "uuid",
            "title": "E-Commerce Platform",
            "description": "Full-stack solution...",
            "image_url": "https://...",
            "live_url": "https://demo.example.com",
            "github_url": "https://github.com/user/project",
            "technologies": ["React", "Node.js", "PostgreSQL"],
            "featured": true
        }
    ]
}
```

#### Create Portfolio Project
```
POST /api/users/portfolio/projects
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "title": "New Project",
    "description": "Project description...",
    "image_url": "https://...",
    "live_url": "https://project.com",
    "github_url": "https://github.com/user/project",
    "technologies": ["Vue.js", "Python", "MongoDB"],
    "featured": false
}

Response: 201 Created
{
    "project": { /* created project object */ }
}
```

### Calendar & Scheduling Endpoints

#### Get User Availability
```
GET /api/users/:username/availability

Response: 200 OK
{
    "availability": [
        {
            "day_of_week": 1,
            "start_time": "09:00:00",
            "end_time": "17:00:00",
            "timezone": "America/Los_Angeles"
        }
    ],
    "meeting_types": [
        {
            "id": "uuid",
            "name": "Coffee Chat",
            "description": "30 min casual conversation",
            "duration": 30,
            "color": "#667eea"
        }
    ]
}
```

#### Get Available Time Slots
```
GET /api/users/:username/availability/slots?date=2024-01-15&meeting_type_id=uuid

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
POST /api/users/:username/meetings
Content-Type: application/json

{
    "meeting_type_id": "uuid",
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
  "sub": "user_id",
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
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
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
2. Seed data (default meeting types, skills categories)
3. Indexes for performance
4. Foreign key constraints

### Performance Optimizations
1. **Database Indexing**
   ```sql
   CREATE INDEX idx_users_username ON users(username);
   CREATE INDEX idx_profiles_slug ON user_profiles(profile_slug);
   CREATE INDEX idx_bookings_user_date ON meeting_bookings(user_id, scheduled_date);
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
- Database models
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