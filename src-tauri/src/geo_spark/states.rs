use serde::{Deserialize, Serialize};
use std::sync::{ atomic::{AtomicBool, Ordering}};

#[warn(unused)]
#[derive(Debug, Serialize, Deserialize)]
pub struct AppData {
    pub is_login: AtomicBool,
}

impl AppData {
    pub fn new() -> Self {
        Self {
            is_login: AtomicBool::new(false),
        }
    }

    pub fn check_login(&self) -> bool {
        self.is_login.load(Ordering::Relaxed)
    }

    pub fn set_login(&self, value: bool) {
        self.is_login.store(value, Ordering::Relaxed);
    }
}
