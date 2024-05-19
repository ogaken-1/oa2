mod get_user;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    use axum::{routing::get, Router};

    let router = Router::new();
    let app = router.route("/", get(|| async { "Hello world!" }));
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}
