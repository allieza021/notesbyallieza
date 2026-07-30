
-- 1. Reload schema cache just in case
NOTIFY pgrst, 'reload schema';

-- 2. Ensure columns exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#4f46e5';

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 5;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

NOTIFY pgrst, 'reload schema';

-- 3. Create category
INSERT INTO categories (name, slug, description, color)
VALUES ('Cybersecurity', 'cybersecurity', 'Posts about cybersecurity and information assurance.', '#10b981')
ON CONFLICT (slug) DO NOTHING;

-- 4. Publish the blog post
INSERT INTO blogs (author_id, title, slug, excerpt, content, category_id, is_published, is_featured, reading_time_minutes, published_at, cover_image_url)
VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'When Fast Moves Break Privacy: A Case Study on Secure Design Principles',
  'when-fast-moves-break-privacy-case-study',
  'An analysis of a university project that prioritized speed over security, leading to a major privacy breach. We explore what went wrong and how to fix it using Secure Design Principles.',
  '# Introduction

The software development landscape has drastically changed over the past few years. As a BS Information Technology student, I''ve seen firsthand how fast a project can move from ideation to deployment. In a recent university project, three students built a mobile-and-web platform designed to help student organizations manage memberships, collect event fees, and share files. To move quickly, they leaned heavily on an AI coding assistant to generate most of the backend code. Within 72 hours, they had a working prototype that won a minor prize at a weekend hackathon. 

However, rapid development can quickly become dangerous when speed is prioritized over security. What started as a simple hackathon demo soon evolved into a live production system used by over a dozen organizations, quietly processing real personal data and payments. The lack of adherence to Secure Design Principles and the Data Privacy Act of 2012 (RA No. 10173) turned this impressive feat of engineering into a massive privacy risk. In this post, we''ll dive deep into what went wrong, the principles that were ignored, and how this platform should be rebuilt securely.

# Case Summary

Three university students built an organization management application over a weekend hackathon. By heavily relying on AI to generate their backend, they accelerated their development and deployed a working prototype. Soon, more than a dozen student organizations began using the app. It was handling sensitive personal information: full names, student numbers, phone numbers, uploaded ID photos, GCash payment screenshots, and private group chats. 

The crisis began when a user noticed they could access another student''s personal record simply by changing the number at the end of their profile URL (from `/profile/1048` to `/profile/1049`). This discovery led to the uncovering of several critical vulnerabilities: the public GitHub repository contained the production database password and a payment API key in plain text; AI-generated backend code was deployed without manual security reviews; database permissions were overly broad; there were no proper authorization checks; the app used plain HTTP instead of HTTPS; full stack traces were visible on errors; and the developers relied entirely on security through obscurity. The application, which was essentially a prototype, was functioning as a production system without ever being secured like one. Ultimately, the application had to be taken offline.

# What Went Wrong

## Broken Access Control
The application failed to enforce boundaries on what authenticated users were allowed to do. When access controls are broken, attackers can bypass intended permissions to act as an administrator, access other users'' accounts, or view sensitive files.

## Insecure Direct Object Reference (IDOR)
Changing the ID in the URL (`/profile/1048` to `/profile/1049`) allowed users to view other people''s data. This is a classic IDOR vulnerability. The application blindly trusted the user-supplied input (the ID) without verifying if the currently logged-in user actually had the right to view that specific record.

## Missing Authorization
While the system might have had authentication (verifying *who* the user is), it lacked authorization (verifying *what* the user is allowed to do). Without authorization checks, any logged-in user could potentially perform actions that should have been restricted to organizational admins.

## Exposed Database Password
The database password was hardcoded and pushed to a public GitHub repository. This is incredibly dangerous because automated bots scrape GitHub constantly looking for secrets. Anyone with that password could connect directly to the database, steal all the data, or delete it entirely.

## Exposed Payment API Key
Similar to the database password, the API key used to process payments was committed in plain text. A malicious actor could use this key to make unauthorized transactions, access financial data, or rack up massive API usage bills.

## AI-generated backend trusted without review
AI coding assistants are designed to write code that works, not necessarily code that is secure. By deploying AI-generated code straight to production without a manual security review, the developers inherited all the hidden vulnerabilities and missing security checks the AI failed to implement.

## Excessive database permissions
The application likely connected to its database using a root or highly privileged account. If an attacker found an SQL injection vulnerability, they wouldn''t just be able to read data—they could drop tables or take over the entire database server.

## HTTP instead of HTTPS
The application transmitted data over plain HTTP instead of encrypted HTTPS. This means all data—including passwords, ID photos, and personal messages—were sent in clear text. Anyone on the same public Wi-Fi network could easily intercept and read this traffic.

## Stack trace exposure
When errors occurred, the application displayed full stack traces to the user. These error messages reveal underlying technologies, file paths, database structures, and library versions—giving attackers a perfect roadmap of the system''s architecture to find known exploits.

## Security through obscurity
The developers assumed that because their app was small and unknown, nobody would bother attacking it or looking at their GitHub repo. Security through obscurity is never a valid defense strategy; attackers use automated tools that don''t care how "unknown" your app is.

## Lack of security testing
No vulnerability scanning, penetration testing, or even basic security checks were performed before real users started inputting their data. 

## Treating a prototype as production
Hackathon prototypes are built with duct tape and hope. They are designed to demonstrate a concept, not to safely handle the sensitive data of thousands of students. Transitioning from prototype to production requires a complete architectural review.

## Mishandling sensitive personal information
Collecting IDs, phone numbers, and payment proofs without proper encryption, access controls, or privacy policies is a severe mishandling of data, directly violating fundamental privacy rights and laws.

# Secure Design Principles Violated

## Least Privilege
**What it means:** Users and programs should only have the minimum privileges necessary to perform their tasks.
**How it was violated:** The database likely used a highly privileged account, and the application lacked proper user roles.
**Impact:** If an attacker compromised an account or found an exploit, they had access to everything instead of being contained.

## Complete Mediation
**What it means:** Every request to access a resource must be checked for authority.
**How it was violated:** The IDOR vulnerability occurred because the application did not check if the user requesting `/profile/1049` was actually user 1049.
**Impact:** Users could freely browse and download everyone else''s private data.

## Defense in Depth
**What it means:** Security should be layered; if one defense fails, another should catch the attack.
**How it was violated:** There were no layers. Passwords were on GitHub, traffic was unencrypted, and endpoints were unprotected.
**Impact:** A single flaw (like finding the GitHub repo) led to total system compromise.

## Fail Secure
**What it means:** When a system fails or encounters an error, it should default to a secure state rather than an insecure one.
**How it was violated:** The application dumped full stack traces on error instead of displaying a generic, safe error message.
**Impact:** Attackers gained valuable intelligence about the backend infrastructure.

## Secure by Default
**What it means:** The default configuration of a system should be its most secure state.
**How it was violated:** The backend was deployed with open permissions and plain HTTP.
**Impact:** Users were put at risk the moment they signed up.

## Minimize Attack Surface
**What it means:** Reduce the number of ways an attacker can enter or extract data from the system.
**How it was violated:** Unnecessary endpoints were left open, and secrets were published publicly.
**Impact:** Attackers had multiple easy vectors to compromise the system.

## Separation of Duties
**What it means:** Critical tasks should require more than one person or role to complete.
**How it was violated:** A single standard user could act essentially as a global admin because of missing authorization.
**Impact:** Normal students could access the data of organization admins.

## Economy of Mechanism
**What it means:** Security mechanisms should be as simple as possible.
**How it was violated:** By relying on complex, unreviewed AI code instead of standard, simple, and proven security frameworks.
**Impact:** The complexity hid vulnerabilities from the student developers.

## Open Design
**What it means:** The security of a system should not depend on the secrecy of its design or implementation.
**How it was violated:** The developers relied on "Security through Obscurity," hoping no one would look at their public GitHub or guess their URLs.
**Impact:** As soon as a user got curious and changed a URL number, the illusion of security shattered.

## Psychological Acceptability
**What it means:** Security mechanisms should not make the resource more difficult to access than if the security mechanism were not present.
**How it was violated:** While not the primary issue, if security is too hard to implement, developers skip it—which is exactly what happened here during the hackathon.
**Impact:** Security was entirely bypassed for the sake of speed.

# Short-Term Containment

## First Few Hours
- **Taking the application offline:** Immediately stopping the server prevents any further data leaks or unauthorized access. This restores **Defense in Depth** by cutting off the primary attack vector.
- **Rotating credentials:** Changing the database passwords ensures that the leaked GitHub credentials are now useless. This supports **Least Privilege**.
- **Revoking API keys:** Invalidating the payment API keys prevents financial theft, enforcing **Complete Mediation**.
- **Removing secrets from GitHub:** Scrubbing the git history prevents future scraping, aligning with **Minimize Attack Surface**.
- **Preserving logs:** Saving the server logs before shutting down is critical to understand who accessed what data.
- **Informing stakeholders:** Notifying the university and organization leaders immediately is an ethical obligation.

## First Few Days
- **Password resets:** Forcing all users to reset their passwords ensures any stolen session tokens or credentials cannot be reused.
- **Session invalidation:** Clearing all active sessions logs out potential attackers, restoring **Fail Secure**.
- **Reviewing logs:** Analyzing access logs to determine exactly which user records and ID photos were accessed by unauthorized users.
- **Patching vulnerabilities:** Fixing the IDOR flaw by adding ownership checks to every endpoint. This restores **Complete Mediation**.
- **Security testing:** Running automated scanners to find any other low-hanging vulnerabilities.
- **Manual review of AI-generated code:** Reading through the backend line-by-line to ensure no backdoors or missing checks exist, restoring **Economy of Mechanism**.
- **Notification of affected users:** Informing the specific students whose GCash receipts or IDs were viewed by others.

# Long-Term Design Improvements

To rebuild this platform securely, the following improvements must be made:

- **Authentication:** Use established libraries (like NextAuth or Supabase Auth) instead of custom AI-generated login scripts. (Supports *Economy of Mechanism*)
- **Authorization & RBAC:** Implement strict checks to ensure users only access their own data, and organization admins only access their members. (Supports *Least Privilege* and *Complete Mediation*)
- **Password Hashing:** Use bcrypt or Argon2 to safely store passwords. (Supports *Defense in Depth*)
- **HTTPS Everywhere:** Enforce TLS/SSL for all connections so data is encrypted in transit. (Supports *Secure by Default*)
- **Environment Variables & Secret Management:** Store passwords and API keys in `.env` files that are strictly added to `.gitignore`. (Supports *Minimize Attack Surface*)
- **Secure File Uploads:** Store ID photos in private cloud buckets with signed URLs that expire, rather than public directories. (Supports *Least Privilege*)
- **Input Validation & Parameterized SQL:** Validate all inputs and use parameterized queries to prevent SQL Injection. (Supports *Fail Secure*)
- **Security Headers & Rate Limiting:** Implement rate limiting to prevent brute force attacks, and use headers like CORS and CSP. (Supports *Defense in Depth*)
- **Code Reviews & Threat Modeling:** Never merge code (especially AI-generated) without a human peer review. (Supports *Open Design*)
- **Privacy by Design:** Only collect data that is strictly necessary. Do they really need uploaded ID photos if student numbers can be verified via a university API? (Supports *Minimize Attack Surface*)

# AI Coding Assistants

AI tools like GitHub Copilot and ChatGPT are revolutionary for productivity. However, AI prioritizes functionality over security. It will give you code that successfully queries a database, but it might not remember to check if the user is authorized to run that query. AI-generated code can appear perfectly formatted and functional while containing catastrophic security holes. Developers remain 100% responsible for the code they deploy. AI should be treated as an assistant that drafts the code—not a senior engineer that replaces manual review and secure software engineering practices.

# RA No. 10173

As IT students in the Philippines, we must understand RA No. 10173, the Data Privacy Act of 2012. 
- **Personal Information:** Any information from which the identity of an individual is apparent (e.g., full names).
- **Sensitive Personal Information:** Includes things like student numbers, IDs, and financial records (GCash receipts).
By collecting this data, the students became Personal Information Controllers (PICs). They had a legal responsibility to ensure the **Confidentiality, Integrity, and Availability** of this data through appropriate **security safeguards**. They failed to practice **Privacy by Design**. Their negligence in leaving API keys on GitHub and exposing IDs to the public could lead to severe legal consequences, including heavy fines and potential imprisonment, not to mention ruining their academic careers. 

# Personal Reflection

Looking at this case from the perspective of an IT student, the biggest lesson learned is that speed should never sacrifice security. It is incredibly tempting to hack together a project, win a prize, and bask in the glory of a live deployment. But the moment you touch real user data, you are holding people''s privacy in your hands. This case changed my perspective on software development: it''s not just about making things work; it''s about making things safe. Secure Design Principles aren''t just boring theory from a textbook; they are the literal shield protecting users from identity theft. Furthermore, while I love using AI to help me code, this case proves that deploying AI code without reading it is like signing a contract blindfolded.

# Conclusion

Ethical software development requires a delicate balance between speed and security. As developers, we carry a heavy accountability for user privacy. Ignoring Secure Design Principles or the mandates of RA No. 10173 is not just bad engineering—it''s professional negligence. We must build secure systems from the very beginning, treating security not as an afterthought or a "version 2.0" feature, but as the foundational bedrock of everything we create. Technology is powerful, but without security, it is just a disaster waiting to happen.
',
  (SELECT id FROM categories WHERE slug = 'cybersecurity' LIMIT 1),
  true,
  true,
  8,
  NOW(),
  '/images/blogs/cybersec_cover.jpg'
);
