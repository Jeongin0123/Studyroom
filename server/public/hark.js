// original source code is taken from:
// https://github.com/SimpleWebRTC/hark
// copyright goes to &yet team
// edited by Muaz Khan for RTCMultiConnection.js
function hark(stream, options) { // 현재 js에는 클래스 개념이 있지만, 이전에는 js에 클래스 개념이 없어서, 함수에서 자가 인스턴스를 생성해서 사용하는 방식을 사용함
    // 오디오 통신 컨택스트 객체
    var audioContextType = window.webkitAudioContext || window.AudioContext;
    

    // 함수 자가 인스턴스 생성
    var harker = this;
    // 함수 자가 변수 생성 self.events
    harker.events = {};
    // 함수 자가 메소드 생성 (websocket에서 사용하는 on 메서드가 아니라, 그냥 harker에서 자체적으로 생성한 on 메서드)
    harker.on = function (event, callback) {
        harker.events[event] = callback;
    };

    // 함수 자가 메소드 생성 (Node.js의 .on, .emit 메서드가 아닌 함수 속 자가 메서드를 생성한 것.)
    harker.emit = function () {
        if (harker.events[arguments[0]]) {
            harker.events[arguments[0]](arguments[1], arguments[2], arguments[3], arguments[4]);
        }
    };

    // make it not break in non-supported browsers
    if (!audioContextType) return harker;

    options = options || {};
    // Config
    var smoothing = (options.smoothing || 0.1),
        interval = (options.interval || 50),
        threshold = options.threshold,
        play = options.play,
        history = options.history || 10,
        running = true;

    // Setup Audio Context
    // 데이터 한번 찍어 보는거 추천
    if (!window.audioContext00) {
        window.audioContext00 = new audioContextType(); // ref) line 7
    }
    // console.log(window.audioContext00);

    var gainNode = audioContext00.createGain();
    gainNode.connect(audioContext00.destination);
    // don't play for self
    gainNode.gain.value = 0;

    var sourceNode, fftBins, analyser;

    analyser = audioContext00.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = smoothing;
    fftBins = new Float32Array(analyser.fftSize);

    //WebRTC Stream
    sourceNode = audioContext00.createMediaStreamSource(stream);
    threshold = threshold || -50;

    sourceNode.connect(analyser);
    if (play) analyser.connect(audioContext00.destination);

    harker.speaking = false;

    harker.setThreshold = function (t) {
        threshold = t;
    };

    harker.setInterval = function (i) {
        interval = i;
    };

    harker.stop = function () {
        running = false;
        harker.emit('volume_change', -100, threshold);
        if (harker.speaking) {
            harker.speaking = false;
            harker.emit('stopped_speaking');
        }
    };
    harker.speakingHistory = [];
    for (var i = 0; i < history; i++) {
        harker.speakingHistory.push(0);
    }

    // Poll the analyser node to determine if speaking
    // and emit events if changed
    var looper = function () {
        setTimeout(function () {
            //check if stop has been called
            if (!running) {
                return;
            }

            var currentVolume = getMaxVolume(analyser, fftBins);

            harker.emit('volume_change', currentVolume, threshold);

            var history = 0;
            if (currentVolume > threshold && !harker.speaking) {
                // trigger quickly, short history
                for (var i = harker.speakingHistory.length - 3; i < harker.speakingHistory.length; i++) {
                    history += harker.speakingHistory[i];
                }
                if (history >= 2) {
                    harker.speaking = true;
                    harker.emit('speaking');
                }
            } else if (currentVolume < threshold && harker.speaking) {
                for (var j = 0; j < harker.speakingHistory.length; j++) {
                    history += harker.speakingHistory[j];
                }
                if (history === 0) {
                    harker.speaking = false;
                    harker.emit('stopped_speaking');
                }
            }
            harker.speakingHistory.shift();
            harker.speakingHistory.push(0 + (currentVolume > threshold));

            looper();
        }, interval);
    };
    looper();

    function getMaxVolume(analyser, fftBins) {
        var maxVolume = -Infinity;
        analyser.getFloatFrequencyData(fftBins);

        for (var i = 4, ii = fftBins.length; i < ii; i++) {
            if (fftBins[i] > maxVolume && fftBins[i] < 0) {
                maxVolume = fftBins[i];
            }
        }

        return maxVolume;
    }

    return harker;
}
