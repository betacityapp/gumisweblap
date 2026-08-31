/*
# Fix contact_submissions anon INSERT privilege

## Problem
The contact_submissions table has RLS policies allowing anon to INSERT,
but the anon role was never granted the INSERT privilege on the table.
This means the public contact form fails with a policy violation error
when a non-authenticated visitor tries to submit a message.

## Changes
- GRANT INSERT on contact_submissions TO anon (in addition to authenticated).
- GRANT SELECT on contact_submissions TO anon so the admin contact page
  (which uses the anon-key client) can list submissions.
*/

GRANT INSERT ON contact_submissions TO anon;
GRANT SELECT ON contact_submissions TO anon;
