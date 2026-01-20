#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Task {
    pub id: u64,
    pub text: String,
    pub done: bool,
}

impl Task {
    pub fn format_line(&self) -> String {
        let done_flag = if self.done { 1 } else { 0 };
        format!("{}|{}|{}", self.id, done_flag, self.text)
    }

    pub fn parse_line(line: &str) -> Option<Self> {
        let mut parts = line.splitn(3, '|');
        let id = parts.next()?.parse::<u64>().ok()?;
        let done = match parts.next()? {
            "0" => false,
            "1" => true,
            _ => return None,
        };
        let text = parts.next()?.to_string();

        Some(Self { id, text, done })
    }
}
