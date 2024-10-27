/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

use chrono::Utc;
use core::{mem::ManuallyDrop, slice};

use cd_core::{
    calculate_interval, Accumulate, FormatOption, D_DIVISOR, H_DIVISOR, MS_DIVISOR, M_DIVISOR,
    S_DIVISOR, W_DIVISOR,
};

const W_SUFFIX: &[u16] = &[119];
const D_SUFFIX: &[u16] = &[100];
const H_SUFFIX: &[u16] = &[104];
const M_SUFFIX: &[u16] = &[109];
const S_SUFFIX: &[u16] = &[115];
const MS_SUFFIX: &[u16] = &[109, 115];

#[derive(Clone, Copy)]
pub struct TimeUnitU16 {
    pub suffix: &'static [u16],
    pub divisor: i64,
}

impl TimeUnitU16 {
    const fn new(suffix: &'static [u16], divisor: i64) -> Self {
        Self { suffix, divisor }
    }
}

const TIME_UNITS_U16: [TimeUnitU16; 6] = [
    TimeUnitU16::new(W_SUFFIX, W_DIVISOR),
    TimeUnitU16::new(D_SUFFIX, D_DIVISOR),
    TimeUnitU16::new(H_SUFFIX, H_DIVISOR),
    TimeUnitU16::new(M_SUFFIX, M_DIVISOR),
    TimeUnitU16::new(S_SUFFIX, S_DIVISOR),
    TimeUnitU16::new(MS_SUFFIX, MS_DIVISOR),
];

const fn as_time_unit_u16(format_option: &FormatOption) -> TimeUnitU16 {
    match format_option {
        FormatOption::Week => TIME_UNITS_U16[0],
        FormatOption::Day => TIME_UNITS_U16[1],
        FormatOption::Hour => TIME_UNITS_U16[2],
        FormatOption::Minute => TIME_UNITS_U16[3],
        FormatOption::Second => TIME_UNITS_U16[4],
        FormatOption::Millisecond => TIME_UNITS_U16[5],
    }
}

struct MyVecU16 {
    inner: Vec<u16>,
}

impl MyVecU16 {
    const fn new(accumulator: Vec<u16>) -> Self {
        Self { inner: accumulator }
    }
}

const SPACE_CHAR: u16 = 32;

impl Accumulate<u16> for MyVecU16 {
    const MINUS_CHAR: u16 = 45;
    fn accumulate(mut self, interval: i64, format_option: &FormatOption) -> (i64, Self) {
        let time_unit: TimeUnitU16 = as_time_unit_u16(format_option);
        let (new_interval, unit_count) = calculate_interval(interval, time_unit.divisor);
        let mut other: Vec<u16> = unit_count.encode_utf16().collect::<Vec<u16>>();
        other.extend_from_slice(time_unit.suffix);
        other.push(SPACE_CHAR);

        if self.inner.len() + other.len() > self.inner.capacity() {
            // Basically panicking because we can't safely reallocate accumulator
            eprintln!(
                "accumulator + other {} exceeded capacity {}",
                self.inner.len() + other.len(),
                self.inner.capacity()
            );
            self.inner.clear();
        } else {
            self.inner.extend_from_slice(&other);
        }
        (new_interval, self)
    }
    fn plus(mut self, element: u16) -> Self {
        if self.inner.len() == self.inner.capacity() {
            // Basically panicking because we can't safely reallocate accumulator
            eprintln!(
                "accumulator + {:?} exceeded capacity {}",
                element,
                self.inner.capacity(),
            );
            self.inner.clear();
        }
        self.inner.push(element);
        self
    }
}

/// Reconstruct a `slice` that was initialized in JavaScript
unsafe fn reconstruct_slice<T>(array_ptr: &*const T, length: libc::size_t) -> &[T] {
    assert!(!array_ptr.is_null());
    assert!(array_ptr.is_aligned());
    assert!(length < usize::MAX / 4);
    // JavaScript owns the data but core consumes the iterator
    // surely the compiler will optimize away the copying
    let array: &[T] = unsafe { slice::from_raw_parts(*array_ptr, length) };
    array
}

/// # Safety
///
/// To ensure safety, `origins` and `pointers` arrays must have length `outer_len`,  
/// `pointers` arrays must be initialized with `inner_cap` capacity as `Uint16Array`s
#[no_mangle]
pub unsafe extern "C" fn update_timers(
    origin_ptr: *const i64,
    pointers: *const *mut u16,
    outer_len: libc::size_t,
    inner_cap: libc::size_t,
) {
    let origins: &[i64] = unsafe { reconstruct_slice(&origin_ptr, outer_len) };
    let now: i64 = Utc::now().timestamp_millis();
    unsafe { reconstruct_slice(&pointers, outer_len) }
        .iter()
        // Taking ownership of the pointers I don't own
        // because I'm a gangsta like that
        .map(|ptr: &*mut u16| unsafe { Vec::from_raw_parts(*ptr, 0, inner_cap) })
        .zip(origins)
        .for_each(|(accumulator, origin)| {
            let accumulators: [MyVecU16; 1] = [MyVecU16::new(accumulator)];
            let _ = ManuallyDrop::new(cd_core::update(accumulators, now, *origin));
        });
}

#[cfg(test)]
mod test_native {
    use super::*;

    #[test]
    fn test() {
        let origins: Vec<i64> = vec![0];
        let outer_len: usize = origins.len();
        let inner_cap: usize = 20;
        let mut accumulator: Vec<u16> = vec![0; inner_cap];
        let pointers: Vec<*mut u16> = vec![accumulator.as_mut_ptr()];
        unsafe { update_timers(origins.as_ptr(), pointers.as_ptr(), outer_len, inner_cap) };

        assert!(
            accumulator.iter().any(|&c| c != 0),
            "update_timers didn't do anything"
        );
        let decoded = char::decode_utf16(accumulator.into_iter());
        decoded.for_each(|c: Result<char, std::char::DecodeUtf16Error>| {
            c.unwrap();
        });
    }
}
