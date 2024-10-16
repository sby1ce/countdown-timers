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
    let pointers: ManuallyDrop<Vec<usize>> = ManuallyDrop::new(
        renders
            .into_iter()
            .flat_map(|render: [String; 1]| {
                let manual: ManuallyDrop<Vec<u16>> =
                    ManuallyDrop::new(render[0].encode_utf16().collect());
                let ptr: *const u16 = manual.as_ptr();
                let length: usize = manual.len();
                [ptr as usize, length]
            })
            .collect(),
    );
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

const MINUS_CHAR: u16 = 45;
const SPACE_CHAR: u16 = 32;
const W_SUFFIX: &[u16] = &[119];
const D_SUFFIX: &[u16] = &[100];
const H_SUFFIX: &[u16] = &[104];
const M_SUFFIX: &[u16] = &[109];
const S_SUFFIX: &[u16] = &[115];
const MS_SUFFIX: &[u16] = &[109, 115];

#[derive(Clone, Copy)]
pub struct TimeUnit {
    pub suffix: &'static [u16],
    pub divisor: i64,
}

impl TimeUnit {
    const fn new(suffix: &'static [u16], divisor: i64) -> Self {
        Self { suffix, divisor }
    }
}

const TIME_UNITS: [TimeUnit; 6] = [
    TimeUnit::new(W_SUFFIX, 1000 * 60 * 60 * 24 * 7),
    TimeUnit::new(D_SUFFIX, 1000 * 60 * 60 * 24),
    TimeUnit::new(H_SUFFIX, 1000 * 60 * 60),
    TimeUnit::new(M_SUFFIX, 1000 * 60),
    TimeUnit::new(S_SUFFIX, 1000),
    TimeUnit::new(MS_SUFFIX, 1),
];

pub enum FormatOption {
    Week,
    Day,
    Hour,
    Minute,
    Second,
    Millisecond,
}

impl FormatOption {
    #[must_use]
    pub fn new(time_unit: &str) -> Option<Self> {
        Some(match time_unit {
            "w" => Self::Week,
            "d" => Self::Day,
            "h" => Self::Hour,
            "m" => Self::Minute,
            "s" => Self::Second,
            "ms" => Self::Millisecond,
            _ => return None,
        })
    }
    #[must_use]
    pub const fn to_time_unit(&self) -> TimeUnit {
        match self {
            Self::Week => TIME_UNITS[0],
            Self::Day => TIME_UNITS[1],
            Self::Hour => TIME_UNITS[2],
            Self::Minute => TIME_UNITS[3],
            Self::Second => TIME_UNITS[4],
            Self::Millisecond => TIME_UNITS[5],
        }
    }
}

fn vec_char<T>(mut accumulator: Vec<T>, other: T) -> Vec<T> {
    accumulator.push(other);
    accumulator
}

fn vec_plus<T: Clone>(mut accumulator: Vec<T>, other: &[T]) -> Vec<T> {
    accumulator.extend_from_slice(other);
    accumulator
}

fn vec_extend<T>(mut accumulator: Vec<T>, mut other: Vec<T>) -> Vec<T> {
    if accumulator.len() + other.len() > 20 {
        // Basically panicing because accumulator can't safely reallocate
        accumulator.clear();
    } else {
        accumulator.append(&mut other);
    }
    accumulator
}

/// Works with positive intervals
fn reduce_interval(
    interval: i64,
    accumulator: Vec<u16>,
    format_options: &[FormatOption],
) -> Vec<u16> {
    let format_len: usize = format_options.len();
    if format_len == 0 {
        return accumulator;
    }
    let format_option: &FormatOption = &format_options[0];
    let time_unit: TimeUnit = format_option.to_time_unit();
    let new_interval: i64 = interval
        .checked_rem_euclid(time_unit.divisor)
        .unwrap_or_default();
    let unit_count: i64 = interval
        .checked_div_euclid(time_unit.divisor)
        .unwrap_or_default();
    let new_accumulator: Vec<u16> = vec_char(
        vec_plus(
            vec_extend(accumulator, unit_count.to_string().encode_utf16().collect()),
            time_unit.suffix,
        ),
        SPACE_CHAR,
    );

    reduce_interval(
        new_interval,
        new_accumulator,
        &format_options[1..format_len],
    )
}

fn convert(accumulator: Vec<u16>, origin: i64) -> Vec<u16> {
    let interval: i64 = origin - Utc::now().timestamp_millis();
    let format_options: [FormatOption; 4] = [
        FormatOption::Day,
        FormatOption::Hour,
        FormatOption::Minute,
        FormatOption::Second,
    ];

    let abs_interval: i64 = interval.abs();

    let accumulator = if interval < 0 {
        vec_char(accumulator, MINUS_CHAR)
    } else {
        accumulator
    };

    reduce_interval(abs_interval, accumulator, &format_options)
}

#[no_mangle]
pub unsafe extern "C" fn experimental(
    origin_ptr: *const i64,
    pointers: *const *mut u16,
    outer_len: libc::size_t,
    inner_cap: libc::size_t,
) {
    let origins: &[i64] = unsafe { reconstruct_slice(&origin_ptr, outer_len) };
    unsafe { reconstruct_slice(&pointers, outer_len) }
        .iter()
        // Taking ownership of the pointers I don't own
        // because I'm a gangsta like that
        .map(|ptr: &*mut u16| unsafe { Vec::from_raw_parts(*ptr, 0, inner_cap) })
        .zip(origins)
        .for_each(|(accumulator, origin)| {
            let _ = ManuallyDrop::new(convert(accumulator, *origin));
        });
}
