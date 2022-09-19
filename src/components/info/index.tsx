import { useContext } from "react";
import { invoke } from '@tauri-apps/api';

import { StateContext } from "../state";
import { GeneratorState } from "../../types";

const Info = () => {
  const state = useContext(StateContext);

  let toggleGenerator = () => invoke("setGeneratorState", { nextState: state.generatorSettings.state === GeneratorState.ACTIVE ? GeneratorState.INACTIVE : GeneratorState.ACTIVE });
  
  let generatorButtonClasses = "generator";

  if (state.generatorSettings.state === GeneratorState.ACTIVE) {
    generatorButtonClasses += " generator__active";
  }

  return (
    <div className="desk_info row">
      <div className="col flex-1">
        {/* <p>{`CSCP Version ${state.deskInfo.cscpVersion}`}</p> */}
        <p>{`Name ${state.deskInfo.name}`}</p>
      </div>
      <div className="col flex-1 align-end">
        <button type="button" className={generatorButtonClasses} onClick={toggleGenerator}>{`GENERATOR`}</button>
      </div>
    </div>
  );
};

export default Info;
