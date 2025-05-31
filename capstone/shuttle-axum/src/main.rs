use axum::Router;
use tower_http::services::ServeDir;

#[shuttle_runtime::main]
async fn main( #[shuttle_shared_db::Postgres] db: PgPool,
) -> shuttle_axum::ShuttleAxum {
    // ServeDir falls back to serve index.html when requesting a directory
    let router = Router::new().nest_service("/", ServeDir::new("assets"));

    Ok(router.into())
}
