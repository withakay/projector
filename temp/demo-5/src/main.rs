use clap::{Parser, Subcommand};

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

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Command::Add { text } => {
            println!("Queued: {text}");
        }
        Command::List => {
            println!("No tasks yet.");
        }
        Command::Done { id } => {
            println!("Marked {id} done.");
        }
        Command::Rm { id } => {
            println!("Removed {id}.");
        }
    }
}
