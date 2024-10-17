/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

use chrono::Utc;
use core::{mem::ManuallyDrop, slice};

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
            let _ = ManuallyDrop::new(cd_core::update_u16(accumulator, now, *origin));
        });
}
