#![allow(non_snake_case, non_camel_case_types)]
use tokio::sync::oneshot;

use super::models::{DB, GeneratorSettings, GeneratorState};


#[derive(Debug, Clone)]
pub struct SetFaderLevel {
  pub index: u16,
  pub level: u16,
}

#[derive(Debug, Clone)]
pub struct SetFaderCut {
  pub index: u16,
  pub isCut: bool,
}

#[derive(Debug, Clone)]
pub struct SetFaderPfl {
  pub index: u16,
  pub isPfl: bool,
}

#[derive(Debug, Clone)]
pub struct SetMainLevel {
  pub index: u16,
  pub level: u16,
}

#[derive(Debug, Clone)]
pub struct SetMainPfl {
  pub index: u16,
  pub isPfl: bool,
}

#[derive(Debug)]
pub enum ClientRequest {
  SET_FADER_LEVEL(SetFaderLevel),
  SET_FADER_CUT(SetFaderCut),
  SET_FADER_PFL(SetFaderPfl),
  SET_MAIN_LEVEL(SetMainLevel),
  SET_MAIN_PFL(SetMainPfl),
  GET_DB(oneshot::Sender<DB>),
}

#[derive(Debug)]
pub enum GeneratorRequest {
  GET(oneshot::Sender<GeneratorSettings>),
  SET_ENABLE(GeneratorState),
  SET_STEP_SIZE(u16),
  SET_INTERVAL(u32),
}
