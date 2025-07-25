use axum::{response::IntoResponse, Json};
use axum::http::StatusCode;
use serde::Serialize;

#[derive(Serialize)]
struct MockDriverResponse {
    message: String,
}

pub async fn mock_driver_leaves() -> impl IntoResponse {
    let response = MockDriverResponse {
        message: "Driver has left.".to_string(),
    };
    (StatusCode::OK, Json(response))
}
