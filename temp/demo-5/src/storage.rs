use std::fs;
use std::io::{self, BufRead, Write};
use std::path::{Path, PathBuf};

use crate::core::Task;

pub fn data_path() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join(".data")
        .join("tasks.txt")
}

fn ensure_data_dir(path: &Path) -> io::Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    Ok(())
}

pub fn load_tasks() -> io::Result<Vec<Task>> {
    let path = data_path();
    ensure_data_dir(&path)?;

    if !path.exists() {
        return Ok(Vec::new());
    }

    let file = fs::File::open(path)?;
    let reader = io::BufReader::new(file);
    let tasks = reader
        .lines()
        .filter_map(|line| line.ok())
        .filter_map(|line| Task::parse_line(&line))
        .collect();

    Ok(tasks)
}

pub fn save_tasks(tasks: &[Task]) -> io::Result<()> {
    let path = data_path();
    ensure_data_dir(&path)?;
    let temp_path = path.with_extension("txt.tmp");
    let mut file = fs::File::create(&temp_path)?;

    for task in tasks {
        writeln!(file, "{}", task.format_line())?;
    }

    file.sync_all()?;
    fs::rename(temp_path, path)?;
    Ok(())
}
