use napi_derive::napi;

#[must_use]
#[napi]
pub const fn plus_100(input: u32) -> u32 {
    input + 100
}
