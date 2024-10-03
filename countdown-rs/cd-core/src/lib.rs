/*
Copyright 2024 sby1ce

SPDX-License-Identifier: AGPL-3.0-or-later
*/

#[derive(Clone, Copy)]
pub struct TimeUnit {
    suffix: &'static str,
    divisor: i64,
}

impl TimeUnit {
    const fn new(suffix: &'static str, divisor: i64) -> Self {
        Self { suffix, divisor }
    }
}

const TIME_UNITS: [TimeUnit; 6] = [
    TimeUnit::new("w", 1000 * 60 * 60 * 24 * 7),
    TimeUnit::new("d", 1000 * 60 * 60 * 24),
    TimeUnit::new("h", 1000 * 60 * 60),
    TimeUnit::new("m", 1000 * 60),
    TimeUnit::new("s", 1000),
    TimeUnit::new("ms", 1),
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

/// Works with positive intervals
fn reduce_interval(interval: i64, accumulator: String, format_options: &[FormatOption]) -> String {
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
    let new_accumulator = accumulator + &unit_count.to_string() + time_unit.suffix + " ";

    reduce_interval(
        new_interval,
        new_accumulator,
        &format_options[1..format_len],
    )
}

fn convert(interval: i64, format_options: &[FormatOption]) -> String {
    let abs_interval: i64 = interval.abs();

    let accumulator: String = String::with_capacity(20) + if interval < 0 { "-" } else { "" };

    reduce_interval(abs_interval, accumulator, format_options)
}

fn update(origin: i64, now: i64) -> [String; 1] {
    let interval: i64 = origin - now;
    let format_options: [FormatOption; 4] = [
        FormatOption::Day,
        FormatOption::Hour,
        FormatOption::Minute,
        FormatOption::Second,
    ];

    [convert(interval, &format_options)]
}

pub fn update_timers_(now: i64, origins: Vec<i64>) -> Vec<[String; 1]> {
    origins
        .into_iter()
        .map(|origin: i64| -> [String; 1] { update(origin, now) })
        .collect::<Vec<[String; 1]>>()
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test() {
        let origins: Vec<i64> = vec![0];
        let a: Vec<[String; 1]> = update_timers_(100_000, origins);

        assert_eq!(a, vec![["-0d 0h 1m 40s "]]);
    }
}
