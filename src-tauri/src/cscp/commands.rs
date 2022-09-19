#![allow(non_snake_case, non_camel_case_types)]
use tauri::{async_runtime::Mutex};
use tokio::sync::{mpsc, oneshot};

use crate::cscp::requests::{SetFaderLevel, SetFaderCut, SetFaderPfl, GeneratorRequest};

use super::{requests::ClientRequest, models::{DB, GeneratorSettings, GeneratorState}};

pub struct ClientInputTx {
  pub inner: Mutex<mpsc::Sender<ClientRequest>>,
}

pub struct GeneratorInputTx {
  pub inner: Mutex<mpsc::Sender<GeneratorRequest>>,
}

#[tauri::command]
pub async fn setFaderLevel(
    index: u16,
    level: u16,
    state: tauri::State<'_, ClientInputTx>,
) -> Result<(), String> {
    // println!("setFaderLevel faderNum={} level={}", index, level);
    // info!(?message, "js2rs");
    let async_proc_input_tx = state.inner.lock().await;
    async_proc_input_tx
        .send(ClientRequest::SET_FADER_LEVEL(SetFaderLevel { index, level }))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn setFaderCut(
    index: u16,
    isCut: bool,
    state: tauri::State<'_, ClientInputTx>,
) -> Result<(), String> {
    // println!("setFaderCut faderNum={} isCut={}", index, isCut);
    // info!(?message, "js2rs");
    let async_proc_input_tx = state.inner.lock().await;
    async_proc_input_tx
        .send(ClientRequest::SET_FADER_CUT(SetFaderCut { index, isCut }))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn setFaderPfl(
    index: u16,
    isPfl: bool,
    state: tauri::State<'_, ClientInputTx>,
) -> Result<(), String> {
    // println!("setFaderPfl faderNum={} isPfl={}", index, isPfl);
    // info!(?message, "js2rs");
    let async_proc_input_tx = state.inner.lock().await;
    async_proc_input_tx
        .send(ClientRequest::SET_FADER_PFL(SetFaderPfl { index, isPfl }))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn getDatabase(
    state: tauri::State<'_, ClientInputTx>,
) -> Result<DB, String> {
    println!("Send DB");
    // info!(?message, "js2rs");
    let (single_tx, single_rx) = oneshot::channel();
    let async_proc_input_tx = state.inner.lock().await;

    async_proc_input_tx
        .send(ClientRequest::GET_DB(single_tx))
        .await
        .unwrap();

    let res = single_rx.await.unwrap();

    println!("DB {:?}", res);

    Ok(res)
}

#[tauri::command]
pub async fn getGenerator(
    state: tauri::State<'_, GeneratorInputTx>,
) -> Result<GeneratorSettings, String> {
    println!("Send gen state");
    // info!(?message, "js2rs");
    let (single_tx, single_rx) = oneshot::channel();
    let async_proc_input_tx = state.inner.lock().await;

    async_proc_input_tx
        .send(GeneratorRequest::GET(single_tx))
        .await
        .unwrap();

    let res = single_rx.await.unwrap();

    println!("SETTINGS {:?}", res);

    Ok(res)
}

#[tauri::command]
pub async fn setGeneratorState(
    next_state: GeneratorState,
    state: tauri::State<'_, GeneratorInputTx>,
) -> Result<(), String> {
    // println!("Set gen state");
    let async_proc_input_tx = state.inner.lock().await;

    async_proc_input_tx
        .send(GeneratorRequest::SET_ENABLE(next_state))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn setGeneratorStep(
    step_size: u16,
    state: tauri::State<'_, GeneratorInputTx>,
) -> Result<(), String> {
    // println!("Set gen step");
    let async_proc_input_tx = state.inner.lock().await;

    async_proc_input_tx
        .send(GeneratorRequest::SET_STEP_SIZE(step_size))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn setGeneratorInterval(
    interval: u32,
    state: tauri::State<'_, GeneratorInputTx>,
) -> Result<(), String> {
    // println!("Set gen interval");
    let async_proc_input_tx = state.inner.lock().await;

    async_proc_input_tx
        .send(GeneratorRequest::SET_INTERVAL(interval))
        .await
        .map_err(|e| e.to_string())
}

