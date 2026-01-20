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

pub fn add_task(tasks: &mut Vec<Task>, text: String) -> Task {
    let next_id = tasks.iter().map(|task| task.id).max().unwrap_or(0) + 1;
    let task = Task {
        id: next_id,
        text,
        done: false,
    };
    tasks.push(task.clone());
    task
}

pub fn mark_done(tasks: &mut [Task], id: u64) -> bool {
    if let Some(task) = tasks.iter_mut().find(|task| task.id == id) {
        task.done = true;
        true
    } else {
        false
    }
}

pub fn remove_task(tasks: &mut Vec<Task>, id: u64) -> bool {
    let before = tasks.len();
    tasks.retain(|task| task.id != id);
    before != tasks.len()
}
