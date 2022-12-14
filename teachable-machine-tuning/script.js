// more documentation available at
// https://github.com/tensorflow/tfjs-models/tree/master/speech-commands

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/-lxsxAesh/";
const resultContainer = document.getElementById("result");
const startButton = document.getElementById("start-button");

startButton.addEventListener("click", () => {
  startButton.innerHTML = "Loading...";
  init();
});
const classes = {
  a: "a",
  b: "b",
  c: "c",
  d: "d",
  e: "e",
  f: "f",
  "Background Noise": "background-noise",
};
async function createModel() {
  const checkpointURL = URL + "model.json"; // model topology
  const metadataURL = URL + "metadata.json"; // model metadata

  const recognizer = speechCommands.create(
    "BROWSER_FFT", // fourier transform type, not useful to change
    undefined, // speech commands vocabulary feature, not useful for your models
    checkpointURL,
    metadataURL
  );

  // check that model and metadata are loaded via HTTPS requests.
  await recognizer.ensureModelLoaded();

  return recognizer;
}

async function init() {
  const recognizer = await createModel();
  const classLabels = recognizer.wordLabels(); // get class labels
  const labelContainer = document.getElementById("label-container");
  for (let i = 0; i < classLabels.length; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }

  startButton.style.display = "none";

  // listen() takes two arguments:
  // 1. A callback function that is invoked anytime a word is recognized.
  // 2. A configuration object with adjustable fields
  recognizer.listen(
    (result) => {
      const scores = result.scores; // probability of prediction for each class
      const maxScore = Math.max(...scores);
      let maxIndex = scores.indexOf(maxScore);
      resultContainer.classList.remove(...resultContainer.classList);

      resultContainer.innerHTML =
        classLabels[maxIndex] + " (" + maxScore.toFixed(2) + ")";

      resultContainer.classList.add(classes[classLabels[maxIndex]]);
      // render the probability scores per class
      for (let i = 0; i < classLabels.length; i++) {
        const classPrediction =
          classLabels[i] + ": " + result.scores[i].toFixed(2);

        let currentNode = labelContainer.childNodes[i];
        currentNode.innerHTML = classPrediction;

        currentNode.style.background = "transparent";

        if (scores[i] === maxScore) {
          currentNode.style.background = "lightgreen";
        }
      }
    },
    {
      includeSpectrogram: true, // in case listen should return result.spectrogram
      probabilityThreshold: 0.75,
      invokeCallbackOnNoiseAndUnknown: true,
      overlapFactor: 0.5, // probably want between 0.5 and 0.75. More info in README
    }
  );

  // Stop the recognition in 5 seconds.
  // setTimeout(() => recognizer.stopListening(), 5000);
}
