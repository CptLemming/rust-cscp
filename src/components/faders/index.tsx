import { useContext } from "react";

import { StateContext } from "../state";
import RenderFader from "./fader";

const RenderFaders = () => {
  const state = useContext(StateContext);

  return (
    <div className="faders">
      {
        state.faders.map(fader => (
          <RenderFader key={fader.index} defaultFader={fader} />
        ))
      }
    </div>
  );
};

export default RenderFaders;
