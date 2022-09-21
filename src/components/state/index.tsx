
import { createContext, ReactNode, useReducer } from 'react';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';

import { AudioWidth, DeskInfo, DeskInfoAction, Fader, FaderAction, GeneratorAction, GeneratorSettings, GeneratorState, StateContextType } from '../../types';
import { useEffect } from 'react';

export const StateContext = createContext<StateContextType>({
  faders: [],
  deskInfo: {
    cscpVersion: 0,
    numFaders: 0,
    numMains: 0,
    name: "",
  },
  generatorSettings: {
    state: GeneratorState.INACTIVE,
    stepSize: 0,
    interval: 0,
  },
});

const fadersReducer = (state: Record<number, Fader>, action: any) => {
  switch (action.type) {
    case FaderAction.INSERT:
      return {
        ...state,
        [action.fader.index]: action.fader,
      };
    case FaderAction.INSERT_BULK:
      return (action.faders as Fader[]).reduce((collection, item) => ({
        ...collection,
        [item.index]: item,
      }), {} as Record<number, Fader>);
    default:
      throw new Error();
  }
}

const deskInfoReducer = (state: DeskInfo, action: any) => {
  switch (action.type) {
    case DeskInfoAction.INSERT:
      return action.deskInfo as DeskInfo;
    default:
      throw new Error();
  }
}

const generatorSettingsReducer = (state: GeneratorSettings, action: any) => {
  switch (action.type) {
    case GeneratorAction.INSERT:
      return action.generatorSettings as GeneratorSettings;
    default:
      throw new Error();
  }
}

interface Props {
  children: ReactNode;
}

const StateManager = (props: Props) => {
  const [faders, fadersDispatch] = useReducer(fadersReducer, {} as Record<number, Fader>);
  const [deskInfo, deskInfoDispatch] = useReducer(deskInfoReducer, {
    cscpVersion: 0,
    numFaders: 0,
    numMains: 0,
    name: "",
  });
  const [generatorSettings, generatorSettingsDispatch] = useReducer(generatorSettingsReducer, {
    state: GeneratorState.INACTIVE,
    stepSize: 0,
    interval: 0,
  });

  useEffect(() => {
    invoke("getDatabase")
      .then((response: any) => {
        console.log('getDatabase response', response);
        deskInfoDispatch({ type: DeskInfoAction.INSERT, deskInfo: response.deskInfo });
        fadersDispatch({ type: FaderAction.INSERT_BULK, faders: response.faders });
      });
    
    invoke("getGenerator")
      .then((response: any) => {
        console.log('getGenerator response', response);
        generatorSettingsDispatch({ type: GeneratorAction.INSERT, generatorSettings: response });
      });

    // listen('fader::changed', (event: any) => {
    //   // console.log("fader::changed", event);
    //   fadersDispatch({ type: FaderAction.INSERT, fader: event.payload });
    // });

    listen('generatorSettings::changed', (event: any) => {
      console.log("generatorSettings::changed", event);
      generatorSettingsDispatch({ type: GeneratorAction.INSERT, generatorSettings: event.payload });
    });
  }, []);

  const state: StateContextType = {
    faders: Object.values(faders)
      .filter((fader) => fader.format !== AudioWidth.NP),
    deskInfo,
    generatorSettings,
  };

  return <StateContext.Provider value={state}>{props.children}</StateContext.Provider>
};

export default StateManager;
