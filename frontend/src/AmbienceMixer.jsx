import { useEffect, useRef, useState } from "react";
import "./AmbienceMixer.css";

import rainIcon from "./assets/rain.jpg";
import thunderIcon from "./assets/thunder.jpg";
import streamIcon from "./assets/stream.jpg";
import campfireIcon from "./assets/campfire.jpg";
import birdIcon from "./assets/bird.jpg";
import winterIcon from "./assets/winter.jpg";

const SOUND_FILES = {
  rain: "/audio/rain.mp3",
  thunder: "/audio/wind.mp3",
  stream: "/audio/stream.mp3",
  campfire: "/audio/campfire.mp3",
  bird: "/audio/bird.mp3",
  winter: "/audio/winter.mp3",
};

function AmbienceMixer() {
  const [isOpen, setIsOpen] = useState(false);

  const [volumes, setVolumes] = useState({
    rain: 70,
    thunder: 70,
    stream: 70,
    campfire: 70,
    bird: 70,
    winter: 70,
  });

  const [masterVolume, setMasterVolume] = useState(70);

  const [playingSounds, setPlayingSounds] = useState({});

  const audioRefs = useRef({});
  const fadeTimers = useRef({});
  const activeDial = useRef(null);
  const previousAngle = useRef(null);
  const didDrag = useRef(false);
  const volumesRef = useRef(volumes);
  const masterVolumeRef = useRef(masterVolume);
  const playingRef = useRef({});

  // Create the audio objects once.
  useEffect(() => {
    Object.entries(SOUND_FILES).forEach(([sound, file]) => {
      const audio = new Audio(file);
      audio.loop = true;
      audio.preload = "none";
      audio.volume = 0;

      audioRefs.current[sound] = audio;
    });

    return () => {
      Object.values(fadeTimers.current).forEach(clearInterval);

      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  function getActualVolume(soundVolume, master = masterVolumeRef.current) {
    return (soundVolume / 100) * (master / 100);
  }

  function clearFade(sound) {
    if (fadeTimers.current[sound]) {
      clearInterval(fadeTimers.current[sound]);
      delete fadeTimers.current[sound];
    }
  }

  // Gradually change the volume of one sound.
  function fadeSound(sound, from, to, duration, onComplete) {
    const audio = audioRefs.current[sound];

    if (!audio) return;

    clearFade(sound);

    const steps = 20;
    const interval = duration / steps;
    let step = 0;

    audio.volume = Math.max(0, Math.min(1, from));

    fadeTimers.current[sound] = setInterval(() => {
      step += 1;

      const progress = Math.min(step / steps, 1);
      audio.volume = Math.max(
        0,
        Math.min(1, from + (to - from) * progress)
      );

      if (step >= steps) {
        clearFade(sound);
        audio.volume = Math.max(0, Math.min(1, to));
        onComplete?.();
      }
    }, interval);
  }

  // Click once to play; click again to fade out and stop.
  async function toggleSound(sound) {
    const audio = audioRefs.current[sound];

    if (!audio) return;

    const isPlaying = Boolean(playingRef.current[sound]);

    if (isPlaying) {
      // Stop the sound after fading it out.
      playingRef.current[sound] = false;
      setPlayingSounds({ ...playingRef.current });

      fadeSound(sound, audio.volume, 0, 450, () => {
        audio.pause();
        audio.currentTime = 0;
      });

      return;
    }

    clearFade(sound);

    playingRef.current[sound] = true;
    setPlayingSounds({ ...playingRef.current });

    audio.volume = 0;

    try {
      await audio.play();

      // Fade in to the selected individual and master volumes.
      const targetVolume = getActualVolume(
        volumesRef.current[sound]
      );

      fadeSound(sound, 0, targetVolume, 450);
    } catch (error) {
      playingRef.current[sound] = false;
      setPlayingSounds({ ...playingRef.current });
      console.error(`Could not play ${sound}:`, error);
    }
  }

  // Update all sounds when the master slider changes.
  function updateMasterVolume(newVolume) {
    masterVolumeRef.current = newVolume;
    setMasterVolume(newVolume);

    Object.keys(SOUND_FILES).forEach((sound) => {
      const audio = audioRefs.current[sound];

      if (audio && playingRef.current[sound]) {
        audio.volume = getActualVolume(
          volumesRef.current[sound],
          newVolume
        );
      }
    });
  }

  // Calculate the pointer's angle around a circular dial.
  function getAngle(event) {
    const rect = event.currentTarget.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    return (
      Math.atan2(
        event.clientY - centerY,
        event.clientX - centerX
      ) *
      (180 / Math.PI)
    );
  }

  function handlePointerDown(event, sound) {
    activeDial.current = sound;
    previousAngle.current = getAngle(event);
    didDrag.current = false;

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!activeDial.current) return;

    const sound = activeDial.current;
    const currentAngle = getAngle(event);

    let difference = currentAngle - previousAngle.current;

    if (difference > 180) difference -= 360;
    if (difference < -180) difference += 360;

    if (Math.abs(difference) > 0) {
      didDrag.current = true;
    }

    const newVolume = Math.max(
      0,
      Math.min(
        100,
        volumesRef.current[sound] + difference / 3.6
      )
    );

    volumesRef.current = {
      ...volumesRef.current,
      [sound]: newVolume,
    };

    setVolumes(volumesRef.current);

    const audio = audioRefs.current[sound];

    if (audio && playingRef.current[sound]) {
      audio.volume = getActualVolume(newVolume);
    }

    previousAngle.current = currentAngle;
  }

  function handlePointerUp() {
    activeDial.current = null;
    previousAngle.current = null;
  }

  function renderSound(sound, label, icon) {
    const volume = volumes[sound];
    const isPlaying = Boolean(playingSounds[sound]);

    return (
      <div className="sound-control" key={sound}>
        <div
          className={`sound-dial ${isPlaying ? "is-playing" : ""}`}
          style={{
            "--volume-angle": `${volume * 3.6}deg`,
          }}
          onPointerDown={(event) =>
            handlePointerDown(event, sound)
          }
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={() => {
            if (didDrag.current) {
              didDrag.current = false;
              return;
            }

            toggleSound(sound);
          }}
          role="button"
          tabIndex={0}
          aria-label={`${isPlaying ? "Stop" : "Play"} ${label}`}
          aria-pressed={isPlaying}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggleSound(sound);
            }
          }}
        >
          <div className="sound-dial-inner">
            <img src={icon} alt="" draggable="false" />
            <span className="sound-volume">{Math.round(volume)}%</span>
          </div>
        </div>

        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className="ambience-mixer">
      {!isOpen && (
        <button
          className="ambience-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open ambience mixer"
        >
          🔊
        </button>
      )}

      {isOpen && (
        <div className="ambience-panel">
          <div className="ambience-header">
            <div>
              <span className="ambience-eyebrow">
                ✦ Atmosphere
              </span>
              <h2>Ambience</h2>
            </div>

            <button
              className="ambience-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close ambience mixer"
            >
              ×
            </button>
          </div>

          <div className="ambience-sounds">
            {renderSound("rain", "Rain", rainIcon)}
            {renderSound("thunder", "Thunder", thunderIcon)}
            {renderSound("stream", "Stream", streamIcon)}
            {renderSound("campfire", "Campfire", campfireIcon)}
            {renderSound("bird", "Birdsong", birdIcon)}
            {renderSound("winter", "Winter", winterIcon)}
          </div>

          <div className="ambience-footer">
            <div className="master-volume">
              <div className="master-volume-header">
                <div className="master-volume-label">
                  <span>🔊</span>
                  <span>Master Volume</span>
                </div>

                <strong>{masterVolume}%</strong>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={(event) =>
                  updateMasterVolume(
                    Number(event.target.value)
                  )
                }
                className="master-volume-slider"
                aria-label="Master volume"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AmbienceMixer;