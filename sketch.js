let video;
let facemesh;
let predictions = [];
let handpose;
let handPredictions = [];
let gesture = 'none'; // 'scissors', 'rock', 'paper', 'none'

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  handpose = ml5.handpose(video, handModelReady);
  handpose.on('predict', results => {
    handPredictions = results;
  });
}

function modelReady() {
  // 模型載入完成，可選擇顯示訊息
}

function handModelReady() {
  // 手部模型載入完成
}

function detectGesture(hand) {
  // 根據手部關鍵點判斷剪刀、石頭、布
  // 這裡用簡單規則：
  // 剪刀：只有食指(8)和中指(12)伸直，其餘彎曲
  // 石頭：五指都彎曲
  // 布：五指都伸直
  // hand.landmarks: [21個點]
  if (!hand) return 'none';
  const tips = [8, 12, 16, 20]; // 食指、中指、無名指、小指指尖
  const base = [6, 10, 14, 18]; // 對應的指根
  let straight = tips.map((tip, i) => {
    return hand.landmarks[tip][1] < hand.landmarks[base[i]][1];
  });
  // 拇指
  let thumbStraight = hand.landmarks[4][0] > hand.landmarks[3][0];

  if (straight[0] && straight[1] && !straight[2] && !straight[3]) return 'scissors';
  if (!straight[0] && !straight[1] && !straight[2] && !straight[3] && !thumbStraight) return 'rock';
  if (straight[0] && straight[1] && straight[2] && straight[3] && thumbStraight) return 'paper';
  return 'none';
}

function draw() {
  image(video, 0, 0, width, height);

  // 手勢偵測
  if (handPredictions.length > 0) {
    gesture = detectGesture(handPredictions[0]);
  } else {
    gesture = 'none';
  }

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;
    let idx = 94; // 預設鼻子
    if (gesture === 'scissors') idx = 10; // 額頭
    else if (gesture === 'rock') idx = 234; // 左臉頰
    else if (gesture === 'paper') idx = 94; // 鼻子
    // 你可根據需要調整點位
    const [x, y] = keypoints[idx];
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 50, 50);
  }
}
