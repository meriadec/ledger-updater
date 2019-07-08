import React, { useEffect, useReducer } from "react";

import { installApp } from "../logic/hw";
import Button from "./Button";
import remapError from "../logic/remapError";
import Logs from "./Logs";
import ProgressBar from "./ProgressBar";
import DisplayError from "./DisplayError";
import { useAppSettings } from "./AppSettingsContext";
import Spaced from "./Spaced";

let logId = 0;

const INITIAL_STATE = {
  logs: [],
  error: null,
  step: "start",
  progress: 0,
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case "ADD_LOG":
      const log = { id: logId++, date: new Date(), text: payload };
      return { ...state, logs: [...state.logs, log] };
    case "SET_ERROR":
      return { ...state, error: payload };
    case "SET_STEP":
      return { ...state, step: payload };
    case "SET_PROGRESS":
      return { ...state, progress: payload };
    default:
      return state;
  }
};

export default ({ onBack }) => {
  const appSettings = useAppSettings();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const addLog = msg => dispatch({ type: "ADD_LOG", payload: msg });
  const setStep = step => dispatch({ type: "SET_STEP", payload: step });
  const setProgress = progress =>
    dispatch({ type: "SET_PROGRESS", payload: progress });
  const setError = err => {
    const remappedError = remapError(err);
    dispatch({ type: "SET_ERROR", payload: remappedError });
    addLog("An error occured. Stopping.");
  };
  const subscribeProgress = stepName => e => {
    if (e.progress === 0) {
      setStep(stepName);
    }
    setProgress(e.progress);
  };

  const { logs, error, step, progress } = state;

  useEffect(() => {
    const sub = installApp({
      appSettings,
      addLog,
      setStep,
      subscribeProgress,
    }).subscribe({
      complete: () => setStep("finished"),
      error: setError,
    });
    return () => {
      sub.unsubscribe();
    };
  }, []);

  const Back = () => <Button onClick={onBack}>Go back</Button>;

  return (
    <Spaced of={20}>
      <Logs logs={logs} />
      {error ? (
        <DisplayError error={error} />
      ) : step === "install-app" || step === "uninstall-app" ? (
        <ProgressBar indeterminate />
      ) : step === "install-app-progress" ? (
        <ProgressBar progress={progress} />
      ) : step === "finished" ? (
        <Spaced of={10}>
          <div>Install successful. You can safely close the updater.</div>
          <Back />
        </Spaced>
      ) : null}
    </Spaced>
  );
};
