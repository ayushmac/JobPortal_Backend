# JobPortal Backend API Documentation (Postman Testing Guide)

This guide is written so you can quickly test all APIs in Postman.

## 1) Base setup

- **Base URL**: `http://localhost:5000`
- **API prefix**: `/api`
- **Auth mechanism for protected APIs**: Cookie (`token`) set by login endpoint.

> Important: Protected routes read JWT from `req.cookies.token`, not Authorization header.

## 2) Postman configuration

1. Create a Postman environment with:
   - `baseUrl = http://localhost:5000`
   - `jobId` (empty)
   - `applicationId` (empty)
   - `userId` (empty)
2. In Postman request settings, keep cookie jar enabled.
3. First call **Login** to store `token` cookie.

## 3) Authentication APIs

### Register
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/auth/register`
- **Body (JSON)**
```json
{
  "name": "Employer One",
  "email": "employer1@test.com",
  "password": "123456",
  "role": "employer"
}
```

### Login (required for protected routes)
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/auth/login`
- **Body (JSON)**
```json
{
  "email": "employer1@test.com",
  "password": "123456"
}
```
- **Expected**: sets `token` cookie.

### Logout
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/auth/logout`

---

## 4) Jobs APIs

### Create Job (employer)
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/jobs`
- **Body (JSON)**
```json
{
  "title": "Frontend Developer",
  "description": "Build React apps",
  "company": "Acme",
  "location": "Remote",
  "salary": 120000
}
```

### Get Public Jobs (search/filter/pagination)
- **Method**: `GET`
- **URL examples**:
  - `{{baseUrl}}/api/jobs`
  - `{{baseUrl}}/api/jobs?page=1&limit=10`
  - `{{baseUrl}}/api/jobs?keyword=frontend&location=remote&company=acme`
  - `{{baseUrl}}/api/jobs?minSalary=50000&maxSalary=150000`

### Get Employer's Own Jobs
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/jobs/mine?page=1&limit=10&keyword=frontend`

### Get Single Job
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/jobs/{{jobId}}`

### Update Job (owner employer)
- **Method**: `PUT`
- **URL**: `{{baseUrl}}/api/jobs/{{jobId}}`
- **Body (JSON)**
```json
{
  "title": "Senior Frontend Developer",
  "salary": 140000
}
```

### Delete Job (owner employer or superadmin)
- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/api/jobs/{{jobId}}`

---

## 5) Applications APIs

### Apply to Job (jobseeker, multipart)
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/applications/apply/{{jobId}}`
- **Body**: `form-data`
  - key: `resume` (type **File**) -> upload file (pdf/doc)

### Jobseeker: My Applications (with status visibility)
- **Method**: `GET`
- **URL examples**:
  - `{{baseUrl}}/api/applications/my`
  - `{{baseUrl}}/api/applications/my?page=1&limit=10&status=pending`
  - `{{baseUrl}}/api/applications/my?keyword=acme`

### Employer: Applications for a specific job
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/applications/job/{{jobId}}?page=1&limit=10&status=pending&keyword=test`

### Employer: All applications across employer jobs (dashboard)
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/applications/employer?page=1&limit=10&status=accepted`

### Employer: Update application status
- **Method**: `PUT`
- **URL**: `{{baseUrl}}/api/applications/{{applicationId}}/status`
- **Body (JSON)**
```json
{
  "status": "accepted"
}
```
- Allowed values: `pending`, `accepted`, `rejected`

---

## 6) Dashboard APIs

### Superadmin stats
- `GET {{baseUrl}}/api/dashboard/admin`

### Employer stats
- `GET {{baseUrl}}/api/dashboard/employer`

### Jobseeker stats
- `GET {{baseUrl}}/api/dashboard/jobseeker`

---

## 7) Superadmin APIs (CRUD + management)

> Requires login as `superadmin`.

### Users
- `GET {{baseUrl}}/api/admin/users?page=1&limit=10&role=employer&keyword=test`
- `POST {{baseUrl}}/api/admin/users`
```json
{
  "name": "New Jobseeker",
  "email": "jobseeker2@test.com",
  "password": "123456",
  "role": "jobseeker"
}
```
- `PUT {{baseUrl}}/api/admin/users/{{userId}}`
```json
{
  "name": "Updated Name",
  "role": "employer"
}
```
- `DELETE {{baseUrl}}/api/admin/users/{{userId}}`

### Jobs
- `GET {{baseUrl}}/api/admin/jobs?page=1&limit=10&location=remote&keyword=frontend&employerId={{userId}}`
- `PUT {{baseUrl}}/api/admin/jobs/{{jobId}}`
```json
{
  "title": "Admin Updated Title",
  "salary": 160000
}
```
- `DELETE {{baseUrl}}/api/admin/jobs/{{jobId}}`

### Applications
- `GET {{baseUrl}}/api/admin/applications?page=1&limit=10&status=pending&jobId={{jobId}}&applicantId={{userId}}`

---

## 8) Test routes

- `GET {{baseUrl}}/api/test/protected`
- `GET {{baseUrl}}/api/test/admin-only`

---

## 9) Suggested Postman testing flow

1. Register 3 users: superadmin, employer, jobseeker.
2. Login as employer -> create job(s) -> save one `_id` as `jobId`.
3. Login as jobseeker -> apply using `jobId` with resume file.
4. Login as employer -> check `/api/applications/employer` and update application status.
5. Login as jobseeker -> check `/api/applications/my` to verify status changes.
6. Login as superadmin -> test `/api/admin/users`, `/api/admin/jobs`, `/api/admin/applications` CRUD/listing.

