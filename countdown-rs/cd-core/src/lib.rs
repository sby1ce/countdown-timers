/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

const W_DIVISOR: i64 = 1000 * 60 * 60 * 24 * 7;
const D_DIVISOR: i64 = 1000 * 60 * 60 * 24;
const H_DIVISOR: i64 = 1000 * 60 * 60;
const M_DIVISOR: i64 = 1000 * 60;
const S_DIVISOR: i64 = 1000;
const MS_DIVISOR: i64 = 1;

#[derive(Clone, Copy)]
pub struct TimeUnit {
    pub suffix: &'static str,
    pub divisor: i64,
}

impl TimeUnit {
    const fn new(suffix: &'static str, divisor: i64) -> Self {
        Self { suffix, divisor }
    }
}

const TIME_UNITS: [TimeUnit; 6] = [
    TimeUnit::new("w", W_DIVISOR),
    TimeUnit::new("d", D_DIVISOR),
    TimeUnit::new("h", H_DIVISOR),
    TimeUnit::new("m", M_DIVISOR),
    TimeUnit::new("s", S_DIVISOR),
    TimeUnit::new("ms", MS_DIVISOR),
];

const MINUS_CHAR: u16 = 45;
const SPACE_CHAR: u16 = 32;
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
    #[must_use]
    pub const fn to_time_unit_u16(&self) -> TimeUnitU16 {
        match self {
            Self::Week => TIME_UNITS_U16[0],
            Self::Day => TIME_UNITS_U16[1],
            Self::Hour => TIME_UNITS_U16[2],
            Self::Minute => TIME_UNITS_U16[3],
            Self::Second => TIME_UNITS_U16[4],
            Self::Millisecond => TIME_UNITS_U16[5],
        }
    }
}

fn calculate_interval(interval: i64, divisor: i64) -> (i64, i64) {
    let new_interval: i64 = interval.checked_rem_euclid(divisor).unwrap_or_default();
    let unit_count: i64 = interval.checked_div_euclid(divisor).unwrap_or_default();
    (new_interval, unit_count)
}

fn next(format_options: &[FormatOption]) -> &[FormatOption] {
    &format_options[1..format_options.len()]
}

/// Works with positive intervals
fn reduce_interval(interval: i64, accumulator: String, format_options: &[FormatOption]) -> String {
    if format_options.is_empty() {
        return accumulator;
    }
    let format_option: &FormatOption = &format_options[0];
    let time_unit: TimeUnit = format_option.to_time_unit();
    let (new_interval, unit_count) = calculate_interval(interval, time_unit.divisor);
    let new_accumulator: String = accumulator + &unit_count.to_string() + time_unit.suffix + " ";

    reduce_interval(new_interval, new_accumulator, next(format_options))
}

fn update(origin: i64, now: i64) -> String {
    let format_options: [FormatOption; 4] = [
        FormatOption::Day,
        FormatOption::Hour,
        FormatOption::Minute,
        FormatOption::Second,
    ];

    let interval: i64 = origin - now;
    let accumulator: String = String::with_capacity(20) + if interval < 0 { "-" } else { "" };
    let abs_interval: i64 = interval.abs();

    reduce_interval(abs_interval, accumulator, &format_options)
}

#[must_use]
pub fn update_timers(now: i64, origins: Vec<i64>) -> Vec<[String; 1]> {
    origins
        .into_iter()
        .map(|origin: i64| -> [String; 1] { [update(origin, now)] })
        .collect::<Vec<[String; 1]>>()
}

/// Works with positive intervals
fn reduce_interval_u16(
    interval: i64,
    accumulator: Vec<u16>,
    format_options: &[FormatOption],
) -> Vec<u16> {
    if format_options.is_empty() {
        return accumulator;
    }
    let format_option: &FormatOption = &format_options[0];
    let time_unit: TimeUnitU16 = format_option.to_time_unit_u16();
    let (new_interval, unit_count) = calculate_interval(interval, time_unit.divisor);
    let new_accumulator: Vec<u16> = vec_plus(
        vec_extend(
            vec_extend(
                accumulator,
                &unit_count.to_string().encode_utf16().collect::<Vec<u16>>(),
            ),
            time_unit.suffix,
        ),
        SPACE_CHAR,
    );

    reduce_interval_u16(new_interval, new_accumulator, next(format_options))
}

fn vec_plus<T>(mut accumulator: Vec<T>, other: T) -> Vec<T> {
    accumulator.push(other);
    accumulator
}

fn vec_extend<T: Clone>(mut accumulator: Vec<T>, other: &[T]) -> Vec<T> {
    if accumulator.len() + other.len() > accumulator.capacity() {
        // Basically panicing because we can't safely reallocate accumulator
        eprintln!(
            "accumulator + other {} exceeded capacity {}",
            accumulator.len() + other.len(),
            accumulator.capacity()
        );
        accumulator.clear();
    } else {
        accumulator.extend_from_slice(other);
    }
    accumulator
}

#[must_use]
pub fn update_u16(accumulator: Vec<u16>, now: i64, origin: i64) -> Vec<u16> {
    let format_options: [FormatOption; 4] = [
        FormatOption::Day,
        FormatOption::Hour,
        FormatOption::Minute,
        FormatOption::Second,
    ];

    let interval: i64 = origin - now;
    let abs_interval: i64 = interval.abs();

    let accumulator: Vec<u16> = if interval < 0 {
        vec_plus(accumulator, MINUS_CHAR)
    } else {
        accumulator
    };

    reduce_interval_u16(abs_interval, accumulator, &format_options)
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test() {
        let origins: Vec<i64> = vec![0];
        let a: Vec<[String; 1]> = update_timers(100_000, origins);

        assert_eq!(a, vec![["-0d 0h 1m 40s "]]);
    }
}
