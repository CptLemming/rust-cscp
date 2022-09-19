import { invoke } from '@tauri-apps/api';
import { PointerEvent, useEffect, useRef, useState } from 'react';
import { AudioType, Fader } from "../../types";

interface Props {
  fader: Fader,
}

const RenderFader = (props: Props) => {
  let index = props.fader.index;
  let isCut = props.fader.isCut;
  let isPfl = props.fader.isPfl;

  let maxValue = 1024;
  let sliderRef = useRef<HTMLDivElement>(null);
  let [sliderHeight, setSliderHeight] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (sliderRef.current) {
        // console.log('slider size', sliderRef.current.offsetHeight);
        setSliderHeight(sliderRef.current.offsetHeight);
      }
    });
  }, []);

  let toggleFaderCut = () => invoke( "setFaderCut", { index, isCut: !isCut });

  let toggleFaderPfl = () => invoke("setFaderPfl", { index, isPfl: !isPfl });

  let sliderPointerDown = (event: PointerEvent) => {
    let level = props.fader.level;
    let pos = event.clientY;

    const handlePointerMove = (event: PointerEvent) => {
      let nextPos = event.clientY;
      let offset = (pos - nextPos) * Math.round(maxValue / sliderHeight);

      invoke("setFaderLevel", { index, level: level + offset });
    };

    const handlePointerUp = (event: PointerEvent) => {
      document.removeEventListener("pointermove", handlePointerMove as any);
      document.removeEventListener("pointerup", handlePointerUp as any);
    };

    document.addEventListener("pointermove", handlePointerMove as any);
    document.addEventListener("pointerup", handlePointerUp as any);
  };

  let faderClasses = "fader";
  if (props.fader.pathType === AudioType.MN) faderClasses += " fader--main";
  else if (props.fader.pathType === AudioType.GP) faderClasses += " fader--group";
  else if (props.fader.pathType === AudioType.AUX) faderClasses += " fader--aux";
  else if (props.fader.pathType === AudioType.TK) faderClasses += " fader--track";

  let pflButtonClasses = "pfl";
  if (props.fader.isPfl) pflButtonClasses += " pfl__active";

  let cutButtonClasses = "cut";
  if (!props.fader.isCut) cutButtonClasses += " cut__active";
  if (props.fader.pathType === AudioType.MN) cutButtonClasses += " invisible";

  const handleSize = 40;
  const handleStyle = {
    bottom: ((sliderHeight / maxValue) * props.fader.level) - (handleSize / 2),
  };

  return (
      <div className={faderClasses}>
        <p className="fader__faderNumber">{`F${props.fader.index + 1}`}</p>
        <div className="fader__level">
          <div ref={sliderRef} className="slider">
            <div className="slider__handle" style={handleStyle} onPointerDown={sliderPointerDown} />
          </div>
        </div>
        <p className="fader__label">{props.fader.label}</p>
        <p className="fader__format">{props.fader.format}</p>
        <div className="fader__controls">
          <button type="button" className={cutButtonClasses} onClick={toggleFaderCut}>{"CUT"}</button>
          <button type="button" className={pflButtonClasses} onClick={toggleFaderPfl}>{"PFL"}</button>
        </div>
      </div>
  );
};

export default RenderFader;
