#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use cscp::{commands::{ClientInputTx, GeneratorInputTx}, models::{Fader, GeneratorSettings, Profile}, generator::CSCPGenerator};
use tauri::{async_runtime::Mutex, Manager, Window};
use tokio::sync::mpsc;

use crate::cscp::{commands::{setFaderLevel, setFaderCut, setFaderPfl, getDatabase, getGenerator, setGeneratorState, setGeneratorStep, setGeneratorInterval}, client::CSCPClient};

mod cscp;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
  let (client_input_tx, client_input_rx) = mpsc::channel(16);
  let (generator_input_tx, generator_input_rx) = mpsc::channel(1);
  let (fader_event_tx, mut fader_event_rx) = mpsc::channel(1);
  let (generator_settings_event_tx, mut generator_settings_event_rx) = mpsc::channel(1);

  let async_generator_tx = client_input_tx.clone();

  tauri::Builder::default()
      .manage(ClientInputTx {
          inner: Mutex::new(client_input_tx),
      })
      .manage(GeneratorInputTx {
          inner: Mutex::new(generator_input_tx),
      })
      .invoke_handler(tauri::generate_handler![
          greet,
          setFaderLevel,
          setFaderCut,
          setFaderPfl,
          getDatabase,
          getGenerator,
          setGeneratorState,
          setGeneratorStep,
          setGeneratorInterval,
      ])
      .setup(|app| {
          let selected_profile = 1;
          let profiles = vec![
              Profile{address: String::from("172.16.255.5"), port: 49556 },
              Profile{address: String::from("172.16.240.5"), port: 49556 },
              Profile{address: String::from("10.211.110.14"), port: 49556 },
          ];

          tauri::async_runtime::spawn(async move {
              let _client = CSCPClient::connect(
                profiles.get(selected_profile).unwrap().connection(),
                  client_input_rx,
                  fader_event_tx,
              ).await.unwrap();
              println!("Client disconnected");
          });
          tauri::async_runtime::spawn(async move {
            let _generator = CSCPGenerator::start(
                generator_input_rx,
                async_generator_tx,
                generator_settings_event_tx,
            ).await.unwrap();
          });

          // let app_handle = app.handle();
          let main_window = app.get_window("main").unwrap();
          tauri::async_runtime::spawn(async move {
              loop {
                  if let Some(fader) = fader_event_rx.recv().await {
                      publish_fader(fader, &main_window);
                  }
              }
          });

          let main_window = app.get_window("main").unwrap();
          tauri::async_runtime::spawn(async move {
              loop {
                  if let Some(settings) = generator_settings_event_rx.recv().await {
                    publish_generator_settings(settings, &main_window);
                  }
              }
          });
          Ok(())
      })
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}

fn publish_fader(fader: Fader, manager: &Window) {
//   println!("fader::changed {:?}", fader);
  manager
      .emit("fader::changed", fader)
      .unwrap();
}

fn publish_generator_settings(settings: GeneratorSettings, manager: &Window) {
//   println!("generatorSettings::changed {:?}", settings);
  manager
      .emit("generatorSettings::changed", settings)
      .unwrap();
}
