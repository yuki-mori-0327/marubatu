// ===== ゲームの状態 =====
const CONTINUE = null;   // まだ決着がついていない
const WIN_PLAYER_1 = 1;  // ○の勝ち
const WIN_PLAYER_2 = -1; // ×の勝ち
const DRAW_GAME = 0;     // 引き分け

// 空なら0、○なら1、×なら-1
const cells = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
];

let turn = 1;          // ○の番なら1、×の番なら-1
let result = CONTINUE; // 現在の勝敗状態
let mode = "hard";     // "hard" or "easy"

// ===== モードが切り替わったときの処理（※セルクリックの外に置く）=====
const modeElements = document.querySelectorAll("input[name='mode']");
for (let modeElement of modeElements) {
  modeElement.addEventListener("change", (event) => {
    mode = event.target.value;
    document.querySelector("#back").classList = mode;
  });
}

// ===== セルクリックのイベント登録 =====
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    const cell = document.querySelector(`#cell_${row}_${col}`);

    cell.addEventListener("click", () => {
      // 決着後にクリックしたらリロード
      if (result !== CONTINUE) {
        window.location.reload(true);
        return;
      }

      // まだ置いてないマスだけ置ける
      if (cells[row][col] !== 0) return;

      // プレイヤー（○）が置く
      putMark(row, col);

      // 置いた直後に勝敗チェック（勝ってたらAIは動かない）
      check();
      if (result !== CONTINUE) return;

      // AI（×）が置く
      thinkAI();

      // AIの後も勝敗チェック
      check();
    });
  }
}

// ===== ○か×を置く =====
function putMark(row, col) {
  const cell = document.querySelector(`#cell_${row}_${col}`);

  if (turn === 1) {
    cell.textContent = "○";
    cell.classList.add("o");
    cells[row][col] = 1;
  } else {
    cell.textContent = "×";
    cell.classList.add("x");
    cells[row][col] = -1;
  }
}

// ===== ゲームの状態を確認 =====
function check() {
  result = judge(cells);
  const message = document.querySelector("#message");

  switch (result) {
    case WIN_PLAYER_1:
      message.textContent = "○の勝ち！";
      break;
    case WIN_PLAYER_2:
      message.textContent = "×の勝ち！";
      break;
    case DRAW_GAME:
      message.textContent = "引き分け！";
      break;
    default:
      // CONTINUE のときは表示を変えない（必要なら空にしてもOK）
      break;
  }
}

// ===== 勝敗を判定する処理 =====
function judge(_cells) {
  // 調べる必要があるラインをリストアップ
  const lines = [
    // 横
    [_cells[0][0], _cells[0][1], _cells[0][2]],
    [_cells[1][0], _cells[1][1], _cells[1][2]],
    [_cells[2][0], _cells[2][1], _cells[2][2]],

    // 縦
    [_cells[0][0], _cells[1][0], _cells[2][0]],
    [_cells[0][1], _cells[1][1], _cells[2][1]],
    [_cells[0][2], _cells[1][2], _cells[2][2]],

    // 斜め
    [_cells[0][0], _cells[1][1], _cells[2][2]],
    [_cells[0][2], _cells[1][1], _cells[2][0]]
  ];

  // 勝ち負けチェック
  for (let line of lines) {
    const sum = line[0] + line[1] + line[2];
    if (sum === 3) return WIN_PLAYER_1;   // ○○○
    if (sum === -3) return WIN_PLAYER_2;  // ×××
  }

  // 継続チェック（0が1つでも残ってたら続行）
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (_cells[row][col] === 0) return CONTINUE;
    }
  }

  // 0が残ってない＝全部埋まってるのに勝者なし → 引き分け
  return DRAW_GAME;
}

// ===== AIに考えてもらう =====
function thinkAI() {
  // ここで「思考の深さ=9」「接待モードかどうか」を渡す（本の想定）
  // mode === "easy" のとき true、それ以外 false
  const hand = think(cells, -1, 9, mode === "easy");

  if (!hand) return;

  const r = hand[0];
  const c = hand[1];

  // 念のため空マス確認（thinkが変な手を返しても壊れにくくする）
  if (cells[r][c] !== 0) return;

  // AI（×）を置く
  turn = -1;
  putMark(r, c);

  // 次はプレイヤー（○）
  turn = 1;
}
