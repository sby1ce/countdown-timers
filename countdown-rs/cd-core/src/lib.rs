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
    pub const fn as_time_unit(&self) -> TimeUnit {
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

fn calculate_interval(interval: i64, divisor: i64) -> (i64, String) {
    let new_interval: i64 = interval.checked_rem_euclid(divisor).unwrap_or_default();
    let unit_count: i64 = interval.checked_div_euclid(divisor).unwrap_or_default();
    (new_interval, unit_count.to_string())
}

pub trait Accumulate<T: Clone> {
    const MINUS_SIGN: T;
    const SPACE_SIGN: T;
    fn accumulate(self, interval: i64, format_option: &FormatOption) -> (i64, Self);
    fn plus(self, element: T) -> Self;
}

struct MyStr {
    inner: String,
}

impl MyStr {
    fn into_string(self) -> String {
        self.inner
    }
}

impl Default for MyStr {
    fn default() -> Self {
        Self {
            // Some calculating concluded that with the length 20
            // the possibility of reallocation is close to 0
            inner: String::with_capacity(20),
        }
    }
}

impl Accumulate<&str> for MyStr {
    const MINUS_SIGN: &'static str = "-";
    const SPACE_SIGN: &'static str = " ";
    fn accumulate(self, interval: i64, format_option: &FormatOption) -> (i64, Self) {
        let time_unit: TimeUnit = format_option.as_time_unit();
        let (new_interval, unit_count) = calculate_interval(interval, time_unit.divisor);
        let new_accumulator: Self = Self {
            inner: self.inner + &unit_count + time_unit.suffix + Self::SPACE_SIGN,
        };
        (new_interval, new_accumulator)
    }
    fn plus(self, element: &str) -> Self {
        Self {
            inner: self.inner + element,
        }
    }
}
fn next(format_options: &[FormatOption]) -> &[FormatOption] {
    &format_options[1..format_options.len()]
}

/// Works with positive intervals
fn reduce_interval<T: Clone, A: Accumulate<T>>(
    interval: i64,
    accumulator: A,
    format_options: &[FormatOption],
) -> A {
    if format_options.is_empty() {
        return accumulator;
    }
    let format_option: &FormatOption = &format_options[0];
    let (new_interval, new_accumulator) = accumulator.accumulate(interval, format_option);

    reduce_interval(new_interval, new_accumulator, next(format_options))
}

fn convert<T: Clone, A: Accumulate<T>>(
    interval: i64,
    accumulator: A,
    format_options: &[FormatOption],
) -> A {
    let abs_interval: i64 = interval.abs();

    let element: T = A::MINUS_SIGN;
    let new_accumulator: A = if interval < 0 {
        accumulator.plus(element)
    } else {
        accumulator
    };

    reduce_interval(abs_interval, new_accumulator, format_options)
}

pub fn update<T: Clone, A: Accumulate<T>>(accumulators: [A; 1], origin: i64, now: i64) -> [A; 1] {
    let interval: i64 = origin - now;
    let format_options: [FormatOption; 4] = [
        FormatOption::Day,
        FormatOption::Hour,
        FormatOption::Minute,
        FormatOption::Second,
    ];

    accumulators.map(|accumulator: A| convert(interval, accumulator, &format_options))
}

pub fn update_timers_(now: i64, origins: Vec<i64>) -> Vec<[String; 1]> {
    let update_accumulators = |origin: i64| -> [MyStr; 1] {
        // One might think this is allocation in a loop
        // but it isn't because accumulators for every origin are entirely separate
        let accumulators: [MyStr; 1] = [MyStr::default()];
        update(accumulators, origin, now)
    };

    origins
        .into_iter()
        .map(update_accumulators)
        .map(|accs: [MyStr; 1]| accs.map(MyStr::into_string))
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
