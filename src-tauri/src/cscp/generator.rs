use std::io::Error;
use std::sync::Arc;
use tauri::async_runtime::Mutex;
use tokio::sync::{mpsc, oneshot};
use tokio::time::{self, Duration};
use crate::cscp::requests::SetFaderLevel;

use super::models::{GeneratorSettings, GeneratorDirection};
use super::requests::{ClientRequest, GeneratorRequest};

pub struct CSCPGenerator;

impl CSCPGenerator {
  pub async fn start(mut input_rx: mpsc::Receiver<GeneratorRequest>, fader_event_tx: mpsc::Sender<ClientRequest>, generator_settings_event_tx: mpsc::Sender<GeneratorSettings>) -> Result<CSCPGenerator, Error> {
    let state = Arc::new(Mutex::new(GeneratorSettings::default()));

    let loop_state = state.clone();
    let inbound_state = state.clone();

    let loop_manager =  tokio::spawn(async move {
      loop {
        {
          let state = loop_state.lock().await;
          if !state.is_active() {
            // Generator is off
            time::sleep(Duration::from_millis(1000)).await;
            continue;
          }
        }

        let (single_tx, single_rx) = oneshot::channel();
        fader_event_tx
              .send(ClientRequest::GET_DB(single_tx))
              .await.unwrap();

        let db = single_rx.await.unwrap();
        let num_faders = db.faders.len() as u16;

        if num_faders < 1 {
          // No faders, try again later
          time::sleep(Duration::from_millis(1000)).await;
          continue;
        }

        let (step_size, step_interval) = {
          let state = loop_state.lock().await;
          (state.stepSize, state.interval)
        };

        let mut interval = time::interval(Duration::from_millis(step_interval as u64));
        let mut level = 0u16;
        let mut direction = GeneratorDirection::INCREMENT;
        loop { 
          interval.tick().await;

          // TODO set level in sine wave instead of same level
          for index in 0..num_faders {
            fader_event_tx
              .send(ClientRequest::SET_FADER_LEVEL(SetFaderLevel { index, level }))
              .await.unwrap();
          }

          match direction {
            GeneratorDirection::INCREMENT => { level += step_size; }
            GeneratorDirection::DECREMENT => {
              if level.checked_sub(step_size).is_none() {
                level = 0;
              } else {
                level -= step_size;
              }
            }
          };

          if level > 1024 {
            direction = GeneratorDirection::DECREMENT;
            level = 1024;
          }
          if level == 0 {
            direction = GeneratorDirection::INCREMENT;
          }

          {
            let state = loop_state.lock().await;
            if !state.is_active() {
              break;
            }
          }
        }
      }
    });

    let inbound_listener = tokio::spawn(async move {
      loop {
        if let Some(req) = input_rx.recv().await {
          println!("Recv GEN request {:?}", req);
          match req {
            GeneratorRequest::GET(msg) => {
              let state = inbound_state.lock().await;
              msg.send(state.clone()).unwrap();
            }
            GeneratorRequest::SET_ENABLE(next_state) => {
              println!("Set active state {:?}", next_state);
              let mut state = inbound_state.lock().await;
              state.set_active(next_state);

              generator_settings_event_tx.send(state.clone()).await.unwrap();
            }
            GeneratorRequest::SET_STEP_SIZE(step_size) => {
              println!("Set gen step size {:?}", step_size);
              let mut state = inbound_state.lock().await;
              state.set_step_sise(step_size);

              generator_settings_event_tx.send(state.clone()).await.unwrap();
            }
            GeneratorRequest::SET_INTERVAL(interval) => {
              println!("Set gen interval {:?}", interval);
              let mut state = inbound_state.lock().await;
              state.set_interval(interval);

              generator_settings_event_tx.send(state.clone()).await.unwrap();
            }
          }
        }
      }
    });

    loop_manager.await.unwrap();
    inbound_listener.await.unwrap();

    Ok(CSCPGenerator)
  }
}
