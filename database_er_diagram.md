# Database ER-Diagram: Social Studies Educational App

## Overview

This ER-diagram represents the complete database schema for the Russian Social Studies educational mobile application, incorporating security, access controls, and compliance with Russian data protection laws (152-ФЗ).

## Core Tables

### 1. Users & Authentication

```mermaid
erDiagram
    users {
        uuid id PK
        string email UK "Encrypted, minimal PII"
        string password_hash "Argon2id"
        string name "Optional, encrypted"
        int grade "8-11, optional"
        string learning_goal "EGE/School/Personal"
        boolean is_active
        boolean email_verified
        timestamp created_at
        timestamp updated_at
        timestamp last_login
        string registration_ip
        boolean parental_consent "For users < 14"
        timestamp parental_consent_date
    }

    user_sessions {
        uuid id PK
        uuid user_id FK
        string access_token "JWT RS256"
        string refresh_token "JWT RS256"
        timestamp access_expires_at
        timestamp refresh_expires_at
        string device_info
        string ip_address
        boolean is_active
        timestamp created_at
    }

    user_roles {
        uuid id PK
        uuid user_id FK
        enum role "student, parent, teacher, admin"
        timestamp granted_at
        uuid granted_by FK
        boolean is_active
    }
```

### 2. Content Structure

```mermaid
erDiagram
    sections {
        uuid id PK
        string title "Человек и общество, Экономика, etc."
        string description
        string icon_url "CDN signed URL"
        int display_order
        boolean is_active
        boolean is_premium
        timestamp created_at
        timestamp updated_at
        string content_version "For rollouts"
    }

    topics {
        uuid id PK
        uuid section_id FK
        string title "Деньги, Рынок, etc."
        string description
        string cover_image "CDN signed URL"
        int grade_level "8-11"
        int display_order
        boolean is_premium
        boolean is_published
        timestamp created_at
        timestamp updated_at
        string content_version
    }

    content_blocks {
        uuid id PK
        uuid topic_id FK
        enum block_type "text, image, video, infographic, mnemonic"
        text content "Encrypted"
        json media_data "CDN URLs, dimensions, expires_at"
        int display_order
        boolean is_premium
        timestamp created_at
        timestamp updated_at
    }
```

### 3. Assessment & Quizzes

```mermaid
erDiagram
    quizzes {
        uuid id PK
        uuid topic_id FK
        string title
        enum quiz_type "mini_test, control_test, section_test"
        int time_limit_minutes
        int passing_score
        boolean is_premium
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    quiz_questions {
        uuid id PK
        uuid quiz_id FK
        string prompt "Encrypted"
        enum question_type "single, multiple, match, flipcard"
        json options "Encrypted"
        json correct_answers "Encrypted, server-side only"
        int display_order
        boolean is_premium
        timestamp created_at
    }

    quiz_attempts {
        uuid id PK
        uuid user_id FK
        uuid quiz_id FK
        timestamp started_at
        timestamp completed_at
        int score
        int max_score
        boolean is_passed
        json answers "Encrypted"
        string attempt_hash "For idempotency"
        timestamp created_at
    }
```

### 4. Progress & Gamification

```mermaid
erDiagram
    user_progress {
        uuid id PK
        uuid user_id FK
        uuid topic_id FK
        int completed_blocks
        int total_blocks
        int best_score
        int attempts_count
        timestamp first_attempt
        timestamp last_attempt
        timestamp completed_at
        timestamp updated_at
    }

    user_achievements {
        uuid id PK
        uuid user_id FK
        string achievement_type "section_complete, streak, etc."
        string title "Эксперт экономики"
        string description
        string icon_url "CDN signed URL"
        int xp_reward
        json metadata
        timestamp awarded_at
        boolean is_claimed
    }

    user_stats {
        uuid id PK
        uuid user_id FK
        int total_xp
        int current_streak
        int longest_streak
        int topics_completed
        int sections_completed
        int total_study_time_minutes
        timestamp last_study_date
        timestamp updated_at
    }
```

### 5. Monetization & Subscriptions

```mermaid
erDiagram
    subscription_plans {
        uuid id PK
        string name "Monthly, Yearly, etc."
        string description
        decimal price_rub
        decimal price_usd
        int duration_days
        json features "Array of premium features"
        boolean is_active
        timestamp created_at
    }

    user_subscriptions {
        uuid id PK
        uuid user_id FK
        uuid plan_id FK
        timestamp started_at
        timestamp expires_at
        enum status "active, expired, cancelled"
        string payment_provider "App Store, Google Play, YooKassa, etc."
        string payment_id
        timestamp created_at
        timestamp updated_at
    }

    payment_transactions {
        uuid id PK
        uuid user_id FK
        uuid subscription_id FK
        decimal amount
        string currency
        string payment_provider
        string payment_id
        enum status "pending, completed, failed, refunded"
        json metadata
        timestamp created_at
    }
```

### 6. Security & Audit

```mermaid
erDiagram
    audit_logs {
        uuid id PK
        uuid user_id FK
        string action "login, content_access, payment, etc."
        string resource_type "topic, quiz, subscription"
        uuid resource_id
        string ip_address
        string user_agent
        json metadata
        timestamp created_at
    }

    content_access_logs {
        uuid id PK
        uuid user_id FK
        uuid content_id FK
        string content_type "topic, block, media"
        string access_method "online, offline_cached"
        timestamp accessed_at
        string ip_address
    }

    security_events {
        uuid id PK
        string event_type "failed_login, suspicious_activity, etc."
        string severity "low, medium, high, critical"
        uuid user_id FK
        string ip_address
        string description
        json metadata
        boolean is_resolved
        timestamp created_at
        timestamp resolved_at
    }
```

## Security Implementation

### Data Encryption

- **PII Fields**: All personal data encrypted at rest using AES-256
- **Content**: Educational content encrypted to prevent unauthorized access
- **Passwords**: Argon2id hashing with salt
- **Media URLs**: Signed CDN URLs with expiration (15-60 minutes)

### Access Control

```mermaid
erDiagram
    role_permissions {
        uuid id PK
        enum role "student, parent, teacher, admin"
        string resource "topics, quizzes, progress, etc."
        string permission "read, write, delete"
        boolean is_active
    }
```

### Compliance Features

- **Parental Consent**: Required for users under 14 (152-ФЗ)
- **Data Retention**: Configurable retention policies
- **Right to Erasure**: Complete data deletion on request
- **Audit Trail**: All personal data access logged
- **Geographic Storage**: Data stored on Russian servers for official release

## API Security Layer

### Rate Limiting

- **IP-based**: 60 requests per minute
- **Token-based**: 10 requests per minute for heavy operations
- **User-based**: 100 requests per minute per user

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth
    participant DB

    Client->>API: POST /v1/auth/login
    API->>Auth: Validate credentials
    Auth->>DB: Check user + password
    DB-->>Auth: User data
    Auth->>API: Generate JWT tokens
    API-->>Client: Access + Refresh tokens

    Client->>API: GET /v1/topics/{id} (with Access token)
    API->>Auth: Validate JWT
    Auth-->>API: User context
    API->>DB: Get topic data
    DB-->>API: Topic + signed media URLs
    API-->>Client: Topic content
```

## Offline Support Schema

### Local Storage Structure

```mermaid
erDiagram
    offline_cache {
        uuid id PK
        uuid user_id FK
        string content_type "topic, quiz, media"
        uuid content_id FK
        json cached_data "Encrypted"
        timestamp cached_at
        timestamp expires_at
        boolean is_synced
    }

    offline_progress {
        uuid id PK
        uuid user_id FK
        uuid topic_id FK
        json local_progress "Encrypted"
        timestamp last_sync
        boolean needs_sync
    }
```

## Backup & Recovery

### Backup Strategy

- **Full Backup**: Daily encrypted backups
- **Incremental**: Hourly incremental backups
- **Point-in-Time**: 30-day retention
- **Geographic**: Cross-region backup storage

### Disaster Recovery

- **RTO**: 4 hours maximum
- **RPO**: 1 hour maximum
- **Testing**: Monthly DR drills

## Monitoring & Alerting

### Key Metrics

- **API Response Times**: < 200ms for 95% of requests
- **Error Rates**: < 1% for all endpoints
- **Authentication Failures**: Alert on >5% failure rate
- **Content Access**: Monitor for unusual patterns
- **Payment Failures**: Real-time alerts

### Security Monitoring

- **Failed Login Attempts**: Alert on >10 per hour per IP
- **Suspicious Content Access**: Unusual download patterns
- **Payment Anomalies**: Large transactions, multiple failures
- **Data Export Requests**: Monitor for bulk data access

## Implementation Notes

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_progress_user_topic ON user_progress(user_id, topic_id);
CREATE INDEX idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_content_access_user_time ON content_access_logs(user_id, accessed_at);

-- Security indexes
CREATE INDEX idx_security_events_ip_time ON security_events(ip_address, created_at);
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id, is_active);
```

### Partitioning Strategy

- **Audit Logs**: Partitioned by month
- **Content Access Logs**: Partitioned by week
- **Quiz Attempts**: Partitioned by month
- **User Sessions**: Partitioned by month

This comprehensive ER-diagram ensures the application meets all security, compliance, and performance requirements while providing a scalable foundation for the educational platform.
