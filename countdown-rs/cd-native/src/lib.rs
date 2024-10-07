/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

use std::mem::ManuallyDrop;

/// Bun FFI doesn't support tuples or structs yet
///
/// Constructing owning `Vec` from raw parts is impossible,
/// because JavaScript owns the data (even though it's being consumed here) and uses own allocator
///
/// Outputs a `Vec<u16>`.
/// Returns a pointer to `Vec` raw parts to pass to `toArrayBuffer` in JavaScript
///
/// # Safety
///
/// To ensure safety, only pass `TypedArray`s directly and their valid length.
/// Also do not mutate the reconstructed `ArrayBuffer` in JS
///
/// # Panics
///
/// Panics if passed in array pointer is null or not aligned
#[no_mangle]
pub unsafe extern "C" fn update_timers(
    array_ptr: *const i64,
    len: libc::size_t,
) -> Box<[usize; 2]> {
    assert!(!array_ptr.is_null());
    assert!(array_ptr.is_aligned());
    assert!(len < usize::MAX / 4);
    println!("Got TypedArray {array_ptr:?}");
    let origins: &[i64] = unsafe { core::slice::from_raw_parts(array_ptr, len) };
    println!("Origins {origins:?}");

    // "0" and "1" in UTF-16
    let vector: ManuallyDrop<Vec<u16>> = ManuallyDrop::new(vec![48, 49]);
    let out_ptr: *const u16 = vector.as_ptr();
    let out_len: usize = vector.len();
    // vector.shrink_to_fit();

    Box::new([out_ptr as usize, out_len])
}

/// Util function because bun's `read.ptr` returns a `number` instead of `Pointer` for some reason
#[no_mangle]
pub const extern "C" fn as_pointer(ptr: usize) -> *const u16 {
    ptr as *const u16
}

/// Takes in a pointer to the first byte and the length as context
///
/// The `Vec<u16>` is assumed to not have been mutated, even though this takes a mut pointer
///
/// # Safety
///
/// To ensure safety only pass pointers from `Vec`s created in `update_timers`.
/// Also, do not mutate those `Vec`s in JavaScript
///
/// # Panics
///
/// Panics if either the passed in pointer to array or the pointer to context (length)
/// are null or not aligned
#[no_mangle]
pub unsafe extern "C" fn drop_vec(ptr: *mut u16, length: libc::size_t) {
    assert!(!ptr.is_null());
    assert!(ptr.is_aligned());
    println!("Pointer to drop {ptr:?} with length {length:?}");
    let vector: Vec<u16> = unsafe { Vec::from_raw_parts(ptr, length, length) };
    drop(vector);
}
