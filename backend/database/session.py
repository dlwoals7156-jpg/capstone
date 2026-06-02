import sqlite3

from backend.app.config import APP_DB_PATH, DATABASE_DIR


# SQLite is used for local capstone development. The service layer keeps DB
# access isolated so it can be swapped for RDS/MySQL during AWS deployment.
def get_connection() -> sqlite3.Connection:
    DATABASE_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(APP_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database() -> None:
    schema_path = DATABASE_DIR / "schema.sql"
    with get_connection() as conn:
        conn.executescript(schema_path.read_text(encoding="utf-8"))
