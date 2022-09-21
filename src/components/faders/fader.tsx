import { PointerEvent, TouchEvent, useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';

import { AudioType, Fader } from "../../types";

interface Props {
  defaultFader: Fader,
}

const RenderFader = (props: Props) => {
  let maxValue = 1024;
  let sliderRef = useRef<HTMLDivElement>(null);
  let sliderHandleRef = useRef<HTMLDivElement>(null);
  let levelRef = useRef(0);
  let positionRef = useRef(0);
  let [sliderHeight, setSliderHeight] = useState(0);
  let [fader, setFader] = useState(props.defaultFader);

  let index = fader.index;
  let isCut = fader.isCut;
  let isPfl = fader.isPfl;

  useEffect(() => {
    requestAnimationFrame(() => {
      if (sliderRef.current) {
        // console.log('slider size', sliderRef.current.offsetHeight);
        setSliderHeight(sliderRef.current.offsetHeight);
      }
    });
  }, []);

  useEffect(() => {
    listen('fader::changed', (event: any) => {
      // console.log("fader::changed", event);
      if (event.payload.index === index) {
        setFader(event.payload);
      }
    });
  }, []);

  let toggleFaderCut = () => invoke( "setFaderCut", { index, isCut: !isCut });

  let toggleFaderPfl = () => invoke("setFaderPfl", { index, isPfl: !isPfl });

  let touchStart = (event: TouchEvent) => {
    event.preventDefault();
    levelRef.current = fader.level;
    positionRef.current = event.touches[0].clientY;
    if (sliderHandleRef.current != null) sliderHandleRef.current.ontouchmove = touchMove as any;
  }

  let touchMove = (event: TouchEvent) => {
    event.preventDefault();
    let nextPos = event.touches[0].clientY;
    let offset = (positionRef.current - nextPos) * Math.round(maxValue / sliderHeight);

    invoke("setFaderLevel", { index, level: levelRef.current + offset });
  };

  let touchEnd = () => {
    if (sliderHandleRef.current != null) sliderHandleRef.current.ontouchmove = null;
  }

  let pointerDown = (event: PointerEvent) => {
    levelRef.current = fader.level;
    positionRef.current = event.clientY;
    if (sliderHandleRef.current != null) {
      sliderHandleRef.current.setPointerCapture(event.pointerId);
      sliderHandleRef.current.onpointermove = pointerMove as any;
    }
  };

  let pointerMove = (event: PointerEvent) => {
    let nextPos = event.clientY;
    let offset = (positionRef.current - nextPos) * Math.round(maxValue / sliderHeight);

    invoke("setFaderLevel", { index, level: levelRef.current + offset });
  };

  let pointerUp = (event: PointerEvent) => {
    if (sliderHandleRef.current != null) {
      sliderHandleRef.current.onpointermove = null;
      sliderHandleRef.current.releasePointerCapture(event.pointerId);
    }
  };

  let faderClasses = "fader";
  if (fader.pathType === AudioType.MN) faderClasses += " fader--main";
  else if (fader.pathType === AudioType.GP) faderClasses += " fader--group";
  else if (fader.pathType === AudioType.AUX) faderClasses += " fader--aux";
  else if (fader.pathType === AudioType.TK) faderClasses += " fader--track";

  let pflButtonClasses = "pfl";
  if (fader.isPfl) pflButtonClasses += " pfl__active";

  let cutButtonClasses = "cut";
  if (!fader.isCut) cutButtonClasses += " cut__active";
  if (fader.pathType === AudioType.MN) cutButtonClasses += " invisible";

  const handleSize = 40;
  const handleStyle = {
    bottom: ((sliderHeight / maxValue) * fader.level) - (handleSize / 2),
  };

  return (
      <div className={faderClasses}>
        <p className="fader__faderNumber">{`F${fader.index + 1}`}</p>
        <div className="fader__level">
          <div ref={sliderRef} className="slider">
            <div
              ref={sliderHandleRef}
              className="slider__handle"
              style={handleStyle}
              onPointerDown={pointerDown}
              onPointerUp={pointerUp}
              onTouchStart={touchStart}
              onTouchEnd={touchEnd}
            />
          </div>
        </div>
        <p className="fader__label">{fader.label}</p>
        <p className="fader__format">{fader.format}</p>
        <div className="fader__controls">
          <button type="button" className={cutButtonClasses} onClick={toggleFaderCut}>{"CUT"}</button>
          <button type="button" className={pflButtonClasses} onClick={toggleFaderPfl}>{"PFL"}</button>
        </div>
      </div>
  );
};

export default RenderFader;
