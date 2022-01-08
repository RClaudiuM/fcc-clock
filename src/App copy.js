import { Button, IconButton } from "@mui/material";
import "./App.css";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useEffect, useRef } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import PauseIcon from "@mui/icons-material/Pause";
import useState from "react-usestateref";

function App() {
  const accurateInterval = function (fn, time) {
    var cancel, nextAt, timeout, wrapper;
    nextAt = new Date().getTime() + time;
    timeout = null;
    wrapper = function () {
      nextAt += time;
      timeout = setTimeout(wrapper, nextAt - new Date().getTime());
      return fn();
    };
    cancel = function () {
      return clearTimeout(timeout);
    };
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return {
      cancel: cancel,
    };
  };
  // state management
  const [timer, setTimer, timerRef] = useState(1500); //1500 seconds = 25 minutes
  const [isTimerRunning, setIsTimerRunning, isTimerRunningRef] =
    useState(false);
  const [breakVal, setBreakVal, breakValRef] = useState(5);
  const [breakDisableUp, setBreakDisableUp, bduRef] = useState(false);
  const [breakDisableDown, setBreakDisableDown, bddRed] = useState(false);
  const [sessionVal, setSessionVal, sessionValRef] = useState(25);
  const [sessionDisableUp, setSessionDisableUp, sduRef] = useState(false);
  const [sessionDisableDown, setSessionDisableDown, sddRef] = useState(false);
  const [curTimerType, setCurTimerType, curTimerTypeRef] = useState("Session");
  const [intervalId, setIntervalId, intervalIdRef] = useState("");

  //ref management
  const audioRef = useRef();

  useEffect(() => {
    //every time breakVal or sessionVal will change
    setTimer(sessionVal * 60);
    setSessionVal(sessionVal);
    setBreakVal(breakVal);
    if (breakVal === 60) {
      setBreakDisableUp(true);
      setBreakDisableDown(false);
    } else if (breakVal === 1) {
      setBreakDisableUp(false);
      setBreakDisableDown(true);
    } else if (sessionVal === 60) {
      setSessionDisableUp(true);
      setSessionDisableDown(false);
    } else if (sessionVal === 1) {
      setSessionDisableUp(false);
      setSessionDisableDown(true);
    }
  }, [breakVal, sessionVal]);

  useEffect(() => {
    //action on timer change
  }, [timer]);

  const handleBreakIncrement = () => {
    if (breakVal < 60) {
      setBreakVal(breakVal + 1);
      setBreakDisableDown(false);
    }
  };

  const handleBreakDecrement = () => {
    if (breakVal > 1) {
      setBreakVal(breakVal - 1);
      setBreakDisableUp(false);
    }
  };

  const handleSessionIncrement = () => {
    if (sessionVal < 60) {
      setSessionVal(sessionVal + 1);

      setSessionDisableDown(false);
    }
  };

  const handleSessionDecrement = () => {
    if (!(sessionVal <= 1)) {
      setSessionVal(sessionVal - 1);
      setSessionDisableUp(false);
    }
  };

  //timer control function
  const timerControl = () => {
    console.log(
      "Entered timerControl with:isTimerRunningRef.current value =  " +
        isTimerRunningRef.current
    );
    if (!isTimerRunningRef.current) {
      console.log("entered if");
      startTimer();
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
      // if there is an interval id cancel it
      if (intervalId) {
        setIntervalId(intervalId.cancel());
      }
    }
  };

  const startTimer = () => {
    setIntervalId(
      accurateInterval(() => {
        decrementTime();
        controlTimer();
      }, 1000)
    );
  };
  const decrementTime = () => {
    setTimer((_timer) => _timer - 1);
  };

  const controlTimer = () => {
    let actualTimer = timerRef.current;
    playAudio(actualTimer);

    if (actualTimer < 0) {
      if (intervalId) {
        console.log(intervalId);
        setIntervalId(intervalId.cancel());
      }
      if (curTimerTypeRef.current === "Session") {
        startTimer();
        changeTimer(breakValRef.current * 60, "Break");
      } else {
        startTimer();
        changeTimer(sessionValRef.current * 60, "Session");
      }
    }
  };

  const changeTimer = (newTimer, newTimerType) => {
    setTimer(newTimer);
    setCurTimerType(newTimerType);
  };

  const playAudio = (actualTimer) => {
    if (actualTimer === 0) {
      audioRef.current.play();
    }
  };

  //handle play pause and reset functions
  const handlePlayPause = (e) => {
    let value = e.currentTarget.attributes.buttontype.value;
    console.log(e.currentTarget.attributes.buttontype.value);

    if (value === "play-button") {
      // play button
      timerControl();
      //set timer is running to true
      setIsTimerRunning(true);

      // set buttons state to disabled when starting timer
      setSessionDisableUp(true);
      setSessionDisableDown(true);
      setBreakDisableUp(true);
      setBreakDisableDown(true);
    } else {
      //pause timer
      timerControl();
      if (intervalId) {
        setIntervalId(intervalId.cancel());
      }
      setIsTimerRunning(false);

      // set buttons states to enabled
      setSessionDisableUp(false);
      setSessionDisableDown(false);
      setBreakDisableUp(false);
      setBreakDisableDown(false);
    }
  };

  const handleReset = () => {
    //stop timer
    setIsTimerRunning(false);

    // pause audio and reset it
    audioRef.current.pause();
    audioRef.current.currentTime = 0;

    //set curTimerType to session
    setCurTimerType("Session");

    // set initial state
    setTimer(1500);
    setBreakVal(5);
    setSessionVal(25);

    // set buttons state to enabled when resetting timer
    setSessionDisableUp(false);
    setSessionDisableDown(false);
    setBreakDisableUp(false);
    setBreakDisableDown(false);
    if (intervalId) {
      setIntervalId(intervalId.cancel());
    }
    //setIntervalId("");
  };

  const makeTimer = () => {
    let minutes = Math.floor(timer / 60);
    let seconds = timer - minutes * 60;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return minutes + ":" + seconds;
  };

  return (
    <div className="app">
      <div className="app-container">
        <div className="title">FCC Strange Clock</div>

        <div className="breakSession-container">
          <div className="break-container">
            <div id="break-label" className="break">
              Break Length
            </div>
            <div className="util-container">
              {/* if breakVal = 60 disable the increment button */}

              {/* <IconButton
                size="large"
                id="break-increment"
                disabled={breakDisableUp}
                onClick={handleBreakIncrement}
              >
                <ArrowUpwardIcon fontSize="inherit" />
              </IconButton> */}
              <Button
                id="break-increment"
                disabled={breakDisableUp}
                onClick={handleBreakIncrement}
              >
                UP
              </Button>
              <div id="break-length" className="break-value">
                {breakVal}
              </div>

              {/* if breakVal = 1 disable decrement button */}
              {/* <IconButton
                size="large"
                id="break-decrement"
                onClick={handleBreakDecrement}
                disabled={breakDisableDown}
              >
                <ArrowDownwardIcon fontSize="inherit" />
              </IconButton> */}
              <Button
                id="break-decrement"
                onClick={handleBreakDecrement}
                disabled={breakDisableDown}
              >
                Down
              </Button>
            </div>
          </div>

          <div className="session-container">
            <div id="session-label" className="break">
              Session Length
            </div>
            <div className="util-container">
              {/* if session length = 60 disable increment button */}

              {/* <IconButton
                size="large"
                id="session-increment"
                onClick={handleSessionIncrement}
                disabled={sessionDisableUp}
              >
                <ArrowUpwardIcon fontSize="inherit" id="session-icon" />
              </IconButton> */}

              <Button
                id="session-increment"
                onClick={handleSessionIncrement}
                disabled={sessionDisableUp}
              >
                UP
              </Button>

              <div id="session-length" className="session-value">
                {sessionVal}
              </div>

              {/* <IconButton
                size="large"
                id="session-decrement"
                onClick={handleSessionDecrement}
                disabled={sessionDisableDown}
              >
                <ArrowDownwardIcon fontSize="inherit" />
              </IconButton> */}
              <Button
                id="session-decrement"
                onClick={handleSessionDecrement}
                disabled={sessionDisableDown}
              >
                DOWN
              </Button>
            </div>
          </div>
        </div>

        <div className="timer-container">
          <div className="timer-label" id="timer-label">
            {curTimerType}
          </div>
          <div className="time-left" id="time-left">
            {makeTimer()}
          </div>
        </div>
        <div className="buttons-container">
          {isTimerRunning ? (
            <div>
              {/* <IconButton onClick={handlePause}> */}
              {/* <IconButton
                onClick={handlePlayPause}
                id="start_stop"
                buttontype="pause-button"
              >
                <PauseIcon />
              </IconButton> */}
              <Button
                onClick={handlePlayPause}
                id="start_stop"
                buttontype="pause-button"
              >
                Pause
              </Button>
            </div>
          ) : (
            <div>
              {/* <IconButton onClick={handlePlay}> */}
              {/* <IconButton
                onClick={handlePlayPause}
                id="start_stop"
                buttontype="play-button"
              >
                <PlayArrowIcon />
              </IconButton> */}
              <Button
                onClick={handlePlayPause}
                id="start_stop"
                buttontype="play-button"
              >
                Play
              </Button>
            </div>
          )}
          <div className="reset">
            {/* <IconButton onClick={handleReset} id="reset">
              <ReplayIcon />
            </IconButton> */}
            <Button onClick={handleReset} id="reset">
              Reset
            </Button>
          </div>
        </div>
      </div>
      <audio
        id="beep"
        preload="auto"
        ref={audioRef}
        src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
      />
    </div>
  );
}

export default App;
