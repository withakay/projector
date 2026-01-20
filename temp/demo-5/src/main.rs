use clap::{Parser, Subcommand};
use std::error::Error;
use todo_demo::{core, storage};

#[derive(Parser)]
#[command(name = "todo")]
#[command(about = "Tiny CLI todo app", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    Add { text: String },
    List,
    Done { id: u64 },
    Rm { id: u64 },
}

fn main() -> Result<(), Box<dyn Error>> {
    let cli = Cli::parse();

    match cli.command {
        Command::Add { text } => {
            let mut tasks = storage::load_tasks()?;
            let task = core::add_task(&mut tasks, text);
            storage::save_tasks(&tasks)?;
            println!("Added {}: {}", task.id, task.text);
        }
        Command::List => {
            let tasks = storage::load_tasks()?;
            if tasks.is_empty() {
                println!("No tasks yet.");
            } else {
                for task in tasks {
                    let marker = if task.done { "x" } else { " " };
                    println!("{} [{}] {}", task.id, marker, task.text);
                }
            }
        }
        Command::Done { id } => {
            let mut tasks = storage::load_tasks()?;
            if core::mark_done(&mut tasks, id) {
                storage::save_tasks(&tasks)?;
                println!("Marked {id} done.");
            } else {
                println!("Task {id} not found.");
            }
        }
        Command::Rm { id } => {
            let mut tasks = storage::load_tasks()?;
            if core::remove_task(&mut tasks, id) {
                storage::save_tasks(&tasks)?;
                println!("Removed {id}.");
            } else {
                println!("Task {id} not found.");
            }
        }
    }

    Ok(())
}
