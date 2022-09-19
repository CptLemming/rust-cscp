export type Fader = {
  index: number,
  label: string,
  level: number,
  isCut: boolean,
  isPfl: boolean,
  pathType: AudioType,
  format: AudioWidth,
};

export type DeskInfo = {
  cscpVersion: number,
  numFaders: number,
  numMains: number,
  name: string,
}

export type DB = {
  faders: Fader[],
  deskInfo: DeskInfo,
}

export type StateContextType = {
  faders: Fader[],
  deskInfo: DeskInfo,
  generatorSettings: GeneratorSettings,
};

export enum FaderAction {
  INSERT,
  INSERT_BULK,
}

export enum DeskInfoAction {
  INSERT,
}

export enum GeneratorAction {
  INSERT,
}

export enum AudioType {
  U = "U",
  CH = "CH",
  GP = "GP",
  VCA_MASTER = "VCA_MASTER",
  VCA_MASTER_CH = "VCA_MASTER_CH",
  VCA_MASTER_GP = "VCA_MASTER_GP",
  MN = "MN",
  VCA_MASTER_MN = "VCA_MASTER_MN",
  TK = "TK",
  VCA_MASTER_TK = "VCA_MASTER_TK",
  AUX = "AUX",
  VCA_MASTER_AUX = "VCA_MASTER_AUX",
}

export enum AudioWidth {
  NP = "NP",
  M = "M",
  ST = "ST",
  UNUSED1 = "UNUSED1",
  UNUSED2 = "UNUSED2",
  UNUSED3 = "UNUSED3",
  SU = "SU",
}

export type GeneratorSettings = {
  state: GeneratorState,
  stepSize: number,
  interval: number,
}

export enum GeneratorState {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}
