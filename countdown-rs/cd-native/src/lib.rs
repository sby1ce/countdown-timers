/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

use core::{mem::ManuallyDrop, slice};

fn work(origins: &[i64]) -> Vec<String> {
    origins.iter().map(ToString::to_string).collect()
}

/// Encodes `String`s into UTF-16 and then marks them for manual drop
///
/// Returns a vector of `usize`s,
/// where every element with an even index is an array pointer
/// and every element with an odd index is a length of the array of the previous pointer
fn convert_vecs(data: Vec<String>) -> Vec<usize> {
    data.into_iter()
        .flat_map(|s: String| -> [usize; 2] {
            let manual: ManuallyDrop<Vec<u16>> = ManuallyDrop::new(s.encode_utf16().collect());
            let ptr: *const u16 = manual.as_ptr();
            let length: usize = manual.len();
            [ptr as usize, length]
        })
        .collect()
}

/// Reconstruct a `slice` that was initialized in JavaScript
unsafe fn reconstruct_slice<T>(array_ptr: &*const T, length: libc::size_t) -> &[T] {
    assert!(!array_ptr.is_null());
    assert!(array_ptr.is_aligned());
    assert!(length < usize::MAX / 4);
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

/// # Safety
///
/// To ensure safety, only pass `TypedArray`s directly and their valid length.
/// Also do not mutate the reconstructed `ArrayBuffer` in JS
///
/// # Panics
///
/// Panics if passed in array pointer is null or not aligned
#[no_mangle]
pub unsafe extern "C" fn work_nat(array_ptr: *const i64, length: libc::size_t) -> Box<[usize; 2]> {
    let origins: &[i64] = unsafe { reconstruct_slice(&array_ptr, length) };
    let worked: Vec<String> = work(origins);
    let pointers: ManuallyDrop<Vec<usize>> = ManuallyDrop::new(convert_vecs(worked));
    let ptr: *const usize = pointers.as_ptr();
    let length: usize = pointers.len();

    Box::new([ptr as usize, length])
}

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
    // JavaScript owns the data but core consumes the iterator
    // surely the compiler will optimize away the copying
    let origins: &[i64] = unsafe { slice::from_raw_parts(array_ptr, len) };
    println!("{origins:?}");

    // The docs don't specify what happens to the memory of the pointer, length and capacity
    // when a `Vec` is marked for manual dropping
    // presumably this means they get cleaned up
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
