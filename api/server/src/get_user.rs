use sqlx::types::Uuid;

#[derive(sqlx::FromRow, Debug, PartialEq)]
pub struct User {
    pub id: Uuid,
    pub email: String,
}

type PgPool = sqlx::Pool<sqlx::Postgres>;
pub async fn get_user(pool: &PgPool) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT * FROM users FETCH FIRST 1 ROW ONLY")
        .fetch_optional(pool)
        .await
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_utils::test_utils::with_schema;
    use tokio_test::assert_ok;

    #[tokio::test]
    async fn get_one() {
        async fn test(pool: PgPool) {
            let user = get_user(&pool).await;
            assert_ok!(&user);
            assert_eq!(user.ok().flatten(), None);
        }
        with_schema(test).await;
    }
}
