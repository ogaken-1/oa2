use sqlx::types::Uuid;

#[derive(sqlx::FromRow, Debug, PartialEq)]
pub struct User {
    pub id: Uuid,
    pub email: String,
}

pub async fn get_user(pool: &sqlx::Pool<sqlx::Postgres>) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT * FROM users FETCH FIRST 1 ROW ONLY")
        .fetch_optional(pool)
        .await
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::postgres::PgPoolOptions;
    use testcontainers::{runners::AsyncRunner, *};
    use tokio_test::assert_ok;

    const PGUSER: &str = "user";
    const PGPASSWORD: &str = "password";
    const PGDATABASE: &str = "oa";

    async fn new_pool(
        container: &ContainerAsync<testcontainers_modules::postgres::Postgres>,
    ) -> sqlx::Pool<sqlx::postgres::Postgres> {
        let host = container.get_host().await;
        let port = container.get_host_port_ipv4(5432).await;
        let uri = format!("postgres://{PGUSER}:{PGPASSWORD}@{host}:{port}/{PGDATABASE}");
        PgPoolOptions::new()
            .max_connections(1)
            .connect(&uri)
            .await
            .unwrap()
    }

    async fn new_container() -> ContainerAsync<testcontainers_modules::postgres::Postgres> {
        let image = testcontainers_modules::postgres::Postgres::default()
            .with_user(PGUSER)
            .with_password(PGPASSWORD)
            .with_db_name(PGDATABASE);
        AsyncRunner::start(image).await
    }

    async fn apply_schema(pool: &sqlx::Pool<sqlx::Postgres>) -> Result<(), sqlx::Error> {
        let content = include_str!("../db/schema.sql");
        let ddls: Vec<&str> = content
            .split(";")
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();
        for ddl in ddls {
            sqlx::query(ddl).execute(pool).await?;
        }
        Ok(())
    }

    #[tokio::test]
    async fn get_one() {
        let container = new_container().await;
        let pool = new_pool(&container).await;
        assert_ok!(apply_schema(&pool).await);
        let user = get_user(&pool).await;
        assert_ok!(&user);
        debug_assert_eq!(user.ok().flatten(), None);
        container.stop().await;
        container.rm().await;
    }
}
