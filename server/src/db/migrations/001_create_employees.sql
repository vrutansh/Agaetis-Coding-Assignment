CREATE TABLE IF NOT EXISTS employees (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(120) NOT NULL CHECK (length(btrim(name)) >= 2),
  email VARCHAR(254) NOT NULL,
  role VARCHAR(100) NOT NULL CHECK (length(btrim(role)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS employees_email_unique_ci
  ON employees (LOWER(email));

CREATE INDEX IF NOT EXISTS employees_created_at_id_idx
  ON employees (created_at DESC, id DESC);
