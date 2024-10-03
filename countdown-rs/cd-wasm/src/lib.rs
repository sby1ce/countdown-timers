/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

use js_sys::Array;
use wasm_bindgen::prelude::{wasm_bindgen, JsValue};


/// Returning JSON of Vec<Vec<String>>
#[wasm_bindgen]
pub fn update_timers(now: i64, origins: Vec<i64>) -> Vec<JsValue> {
    cd_core::update_timers_(now, origins)
        .into_iter()
        .map(|arr: [String; 1]| {
            JsValue::from(arr.into_iter().map(JsValue::from).collect::<Array>())
        })
        .collect::<Vec<_>>()
}
