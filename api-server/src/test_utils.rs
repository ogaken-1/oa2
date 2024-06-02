#[cfg(test)]
pub mod test_utils {
    type PgPool = sqlx::Pool<sqlx::Postgres>;
    type PgContainer = ContainerAsync<testcontainers_modules::postgres::Postgres>;
    use sqlx::postgres::PgPoolOptions;
    use testcontainers::{runners::AsyncRunner, ContainerAsync, RunnableImage};
    use tokio_test::assert_ok;

    const PGUSER: &str = "user";
    const PGPASSWORD: &str = "password";
    const PGDATABASE: &str = "oa";

    async fn new_pool(container: &PgContainer) -> PgPool {
        let host = container.get_host().await;
        let port = container.get_host_port_ipv4(5432).await;
        let uri = format!("postgres://{PGUSER}:{PGPASSWORD}@{host}:{port}/{PGDATABASE}");
        PgPoolOptions::new()
            .max_connections(1)
            .connect(&uri)
            .await
            .unwrap()
    }

    async fn new_container() -> PgContainer {
        let image = RunnableImage::from(
            testcontainers_modules::postgres::Postgres::default()
                .with_user(PGUSER)
                .with_password(PGPASSWORD)
                .with_db_name(PGDATABASE),
        )
        .with_tag("16.3-bookworm");
        AsyncRunner::start(image).await
    }

    async fn apply_schema(pool: &PgPool) -> sqlx::Result<()> {
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

    pub async fn with_schema<F, Fut>(test: F)
    where
        F: Fn(PgPool) -> Fut,
        Fut: std::future::Future<Output = ()>,
    {
        let container = new_container().await;
        let pool = new_pool(&container).await;
        assert_ok!(apply_schema(&pool).await);
        test(pool).await;
        container.stop().await;
        container.rm().await;
    }
}
