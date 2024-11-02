use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
 
#[derive(Serialize, Deserialize)]
struct TypeDataPost {
    nama: String,
    umur: u32,
}
 
async fn get_api() -> impl Responder {
    HttpResponse::Ok().body("Hello, World!")
}
 
async fn post_api(data: web::Json<TypeDataPost>) -> impl Responder {
    HttpResponse::Ok().json(data.into_inner())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/get_url", web::get().to(get_api))
            .route("/post_url", web::post().to(post_api))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}