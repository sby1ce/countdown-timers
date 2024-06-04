use std::time::{SystemTime, UNIX_EPOCH};
use wasm_bindgen::prelude::wasm_bindgen;

#[derive(Clone, Copy)]
pub struct TimeUnit {
    suffix: &'static str,
    divisor: u64,
}

impl TimeUnit {
    const fn new(suffix: &'static str, divisor: u64) -> Self {
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

fn reduce_interval(interval: u64, result: String, format_options: &[FormatOption]) -> String {
    let format_len = format_options.len();
    if format_len == 0 {
        return result;
    }
    let format_option = &format_options[0];
    let time_unit = format_option.to_time_unit();
    let new_interval = interval
        .checked_rem_euclid(time_unit.divisor)
        .unwrap_or_default();
    let unit_count = interval
        .checked_div_euclid(time_unit.divisor)
        .unwrap_or_default();
    let new_result = result + &unit_count.to_string() + time_unit.suffix + " ";
    reduce_interval(new_interval, new_result, &format_options[1..format_len])
}

fn update(origin: u64, now: u64) -> [String; 1] {
    let interval: u64 = now.checked_sub(origin).unwrap_or_default();
    let format_options: [FormatOption; 4] = [
        FormatOption::Day,
        FormatOption::Hour,
        FormatOption::Minute,
        FormatOption::Second,
    ];
    [reduce_interval(
        interval,
        String::with_capacity(12),
        &format_options,
    )]
}

/// Returning JSON of Vec<Vec<String>>
#[wasm_bindgen]
pub fn update_timers(origins: Vec<u64>) -> String {
    let now: u64 = u64::try_from(SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("time went backwards")
        .as_millis())
        .expect("millions of years in the future");

    serde_json::to_string(&origins
        .into_iter()
        .map(|origin: u64| -> [String; 1] { update(origin, now) })
        .collect::<Vec<[String; 1]>>()).unwrap_or_else(|error| format!("{error:?}"))
}
