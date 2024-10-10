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

/// Reconstruct a `Vec` that was passed through FFI and back
unsafe fn reconstruct_vec<T>(array_ptr: *mut T, length: libc::size_t) -> Vec<T> {
    assert!(!array_ptr.is_null());
    assert!(array_ptr.is_aligned());
    assert!(length < usize::MAX / 4);
    let vector: Vec<T> = unsafe { Vec::from_raw_parts(array_ptr, length, length) };
    vector
}

/// Bun FFI doesn't support tuples or structs yet
///
/// Constructing owning `Vec` from raw parts is impossible,
/// because JavaScript owns the data (even though it's being consumed here) and uses own allocator
///
/// Outputs a `Vec<Vec<u16>>` as a `BigUint64Array` 
/// where every even element is a pointer to inner `Vec` 
/// and every odd element is the length of the `Vec` previous pointer points to. 
/// 
/// I guarantee the array length will be even. 
/// 
/// Drop it using `drop_pointers`.
/// 
/// Returns a pointer to `Vec` raw parts to pass to `toArrayBuffer` in JavaScript
/// 
/// TODO make it putput `Vec<Vec<Vec<u16>>`
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
    length: libc::size_t,
) -> Box<[usize; 2]> {
    let origins: &[i64] = unsafe { reconstruct_slice(&array_ptr, length) };

    // Using `chrono` instead of `std::time` because that one uses u128
    let now: i64 = Utc::now().timestamp_millis();
    let renders: Vec<[String; 1]> = cd_core::update_timers_(now, origins.to_owned());

    // The docs don't specify what happens to the memory of the pointer, length and capacity
    // when a `Vec` is marked for manual dropping
    // presumably this means they get cleaned up
    //
    // Encodes `String`s into UTF-16 and then marks them for manual drop
    //
    // A vector of `usize`s,
    // where every element with an even index is an array pointer
    // and every element with an odd index is a length of the array of the previous pointer
    let pointers: ManuallyDrop<Vec<usize>> = ManuallyDrop::new(renders
        .into_iter()
        .flat_map(|render: [String; 1]| {
            let manual: ManuallyDrop<Vec<u16>> =
                ManuallyDrop::new(render[0].encode_utf16().collect());
            let ptr: *const u16 = manual.as_ptr();
            let length: usize = manual.len();
            [ptr as usize, length]
        })
        .collect());
    let out_ptr: *const usize = pointers.as_ptr();
    let out_len: usize = pointers.len();
    // vector.shrink_to_fit();

    Box::new([out_ptr as usize, out_len])
}

/// Util function because bun's `read.ptr` returns a `number` instead of `Pointer` for some reason
#[no_mangle]
pub const extern "C" fn as_pointer(ptr: usize) -> *const u16 {
    ptr as *const u16
}

/// Drop the flattened array of pointer and length pairs
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
pub unsafe extern "C" fn drop_pointers(array_ptr: *mut usize, length: libc::size_t) {
    let vector: Vec<usize> = unsafe { reconstruct_vec(array_ptr, length) };
    drop(vector);
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
    let vector: Vec<u16> = unsafe { Vec::from_raw_parts(ptr, length, length) };
    drop(vector);
}
