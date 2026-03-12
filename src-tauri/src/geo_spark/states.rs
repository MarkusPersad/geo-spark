use serde::{Deserialize, Serialize};
use std::sync::{ atomic::{AtomicBool, Ordering}, RwLock};

#[warn(unused)]
#[derive(Debug, Serialize, Deserialize)]
pub struct AppData {
    pub is_login: AtomicBool,
    pub tileset_base_path: RwLock<String>,
    pub shapefile_base_path: RwLock<String>,
}

impl AppData {
    pub fn new() -> Self {
        Self {
            is_login: AtomicBool::new(false),
            tileset_base_path: RwLock::new(String::new()),
            shapefile_base_path: RwLock::new(String::new()),
        }
    }

    pub fn check_login(&self) -> bool {
        self.is_login.load(Ordering::Relaxed)
    }

    pub fn set_login(&self, value: bool) {
        self.is_login.store(value, Ordering::Relaxed);
    }
    pub fn set_tileset_base_path(&self, value: String) {
        *self.tileset_base_path.write().unwrap() = value;
    }
    pub fn get_tileset_base_path(&self) -> String {
        self.tileset_base_path.read().unwrap().clone()
    }
    pub fn set_shapefile_base_path(&self, value: String) {
        *self.shapefile_base_path.write().unwrap() = value;
    }
    pub fn get_shapefile_base_path(&self) -> String {
        self.shapefile_base_path.read().unwrap().clone()
    }
}
