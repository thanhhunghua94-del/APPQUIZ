// =====================================================
// 1. CHUYỂN TAB
// =====================================================
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    // toggle(tên class, điều kiện): bật class nếu điều kiện đúng, tắt nếu sai
    tabs.forEach((t) => t.classList.toggle('active', t === tab));
    panels.forEach((p) => p.classList.toggle('active', p.id === tab.dataset.tab));
  });
});

// =====================================================
// 2. ĐỒNG HỒ TẬP TRUNG (Pomodoro)
// =====================================================
const ringBar = document.getElementById('ringBar');
const timeText = document.getElementById('timeText');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionCountEl = document.getElementById('sessionCount');
const modeButtons = document.querySelectorAll('.mode');

// Chu vi vòng tròn = 2 × π × bán kính (r = 54 trong HTML)
const RING_LENGTH = 2 * Math.PI * 54;
ringBar.style.strokeDasharray = RING_LENGTH;

let totalSeconds = 25 * 60; // tổng thời gian của chế độ hiện tại
let secondsLeft = totalSeconds;
let timerId = null;         // null = đang dừng
let sessions = 0;

// Cập nhật chữ số và vòng tròn
function drawTimer() {
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  timeText.textContent = minutes + ':' + seconds;
  document.title = minutes + ':' + seconds + ' · Góc Học Tập';

  // Phần vòng tròn còn lại tỉ lệ với thời gian còn lại
  ringBar.style.strokeDashoffset = RING_LENGTH * (1 - secondsLeft / totalSeconds);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function toggleTimer() {
  if (timerId) {                       // đang chạy -> tạm dừng
    stopTimer();
    startBtn.textContent = 'Tiếp tục';
    return;
  }
  startBtn.textContent = 'Tạm dừng';
  timerId = setInterval(() => {        // chạy lại mỗi 1000ms = 1 giây
    secondsLeft--;
    drawTimer();
    if (secondsLeft <= 0) {
      stopTimer();
      startBtn.textContent = 'Bắt đầu';
      if (totalSeconds === 25 * 60) {  // chỉ tính phiên tập trung 25 phút
        sessions++;
        sessionCountEl.textContent = sessions;
      }
      alert('Hết giờ! Làm tốt lắm 🎉');
    }
  }, 1000);
}

function resetTimer() {
  stopTimer();
  secondsLeft = totalSeconds;
  startBtn.textContent = 'Bắt đầu';
  drawTimer();
}

// Đổi chế độ (Tập trung / Nghỉ ngắn / Nghỉ dài)
modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    modeButtons.forEach((b) => b.classList.toggle('active', b === btn));
    totalSeconds = Number(btn.dataset.minutes) * 60;
    resetTimer();
  });
});

startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);

// =====================================================
// 3. THẺ GHI NHỚ (Flashcards)
// =====================================================
const cards = [
  { q: 'ROE là gì?', a: 'Tỷ suất lợi nhuận trên vốn chủ sở hữu = Lợi nhuận sau thuế / Vốn chủ sở hữu.' },
  { q: 'ROA là gì?', a: 'Tỷ suất lợi nhuận trên tổng tài sản = Lợi nhuận sau thuế / Tổng tài sản.' },
  { q: 'P/E là gì?', a: 'Hệ số giá trên thu nhập = Giá cổ phiếu / EPS. Cho biết nhà đầu tư trả bao nhiêu cho 1 đồng lợi nhuận.' },
  { q: 'EPS là gì?', a: 'Thu nhập trên mỗi cổ phiếu = Lợi nhuận sau thuế / Số cổ phiếu đang lưu hành.' },
  { q: 'Lãi suất kép là gì?', a: 'Lãi được cộng vào vốn, kỳ sau tính lãi trên cả vốn lẫn lãi đã nhận.' },
  { q: 'Tỷ số thanh toán hiện hành?', a: 'Tài sản ngắn hạn / Nợ ngắn hạn. Đo khả năng trả các khoản nợ đến hạn.' },
  { q: 'Tỷ số D/E?', a: 'Nợ phải trả / Vốn chủ sở hữu. Đo mức độ sử dụng đòn bẩy tài chính.' },
  { q: 'Đa dạng hóa danh mục?', a: 'Phân bổ vốn vào nhiều tài sản khác nhau để giảm rủi ro khi một tài sản giảm giá.' }
];

const flipCard = document.getElementById('flipCard');
const cardFront = document.getElementById('cardFront');
const cardBack = document.getElementById('cardBack');
const cardCount = document.getElementById('cardCount');
const progressBar = document.getElementById('progressBar');
const knownBtn = document.getElementById('knownBtn');

let index = 0;               // đang xem thẻ số mấy
const known = new Set();     // Set: tập hợp các thẻ đã thuộc (không bị trùng)

function updateCard() {
  cardFront.textContent = cards[index].q;
  cardBack.textContent = cards[index].a;
  cardCount.textContent = 'Thẻ ' + (index + 1) + '/' + cards.length + ' · Đã thuộc ' + known.size;
  progressBar.style.width = (known.size / cards.length * 100) + '%';
  flipCard.classList.toggle('known', known.has(index));
  knownBtn.textContent = known.has(index) ? '↺ Bỏ đánh dấu' : '✓ Đã thuộc';
}

// Đổi thẻ: lật về mặt trước trước, đợi lật xong mới đổi chữ (để không lộ đáp án)
function goTo(newIndex) {
  const wasFlipped = flipCard.classList.contains('flipped');
  flipCard.classList.remove('flipped');
  index = (newIndex + cards.length) % cards.length; // quay vòng khi hết thẻ
  setTimeout(updateCard, wasFlipped ? 250 : 0);
}

function toggleFlip() {
  flipCard.classList.toggle('flipped');
}

flipCard.addEventListener('click', toggleFlip);
document.getElementById('prevBtn').addEventListener('click', () => goTo(index - 1));
document.getElementById('nextBtn').addEventListener('click', () => goTo(index + 1));

knownBtn.addEventListener('click', () => {
  if (known.has(index)) known.delete(index);
  else known.add(index);
  updateCard();
});

// =====================================================
// 4. PHÍM TẮT
// =====================================================
document.addEventListener('keydown', (event) => {
  const onCardsTab = document.getElementById('cards').classList.contains('active');

  // Space = bắt đầu/tạm dừng (chỉ khi không đang focus vào nút nào, tránh bị kích hoạt 2 lần)
  if (event.code === 'Space' && event.target === document.body) {
    event.preventDefault();
    toggleTimer();
  }
  if (onCardsTab && event.key === 'ArrowRight') goTo(index + 1);
  if (onCardsTab && event.key === 'ArrowLeft') goTo(index - 1);
  if (onCardsTab && event.key === 'Enter' && event.target === flipCard) toggleFlip();
});

// =====================================================
// 5. KHỞI TẠO
// =====================================================
drawTimer();
updateCard();

// =====================================================
// 6. TRẮC NGHIỆM + TẢI BÀI LÊN
// =====================================================
const setSelect = document.getElementById('setSelect');
const deleteSetBtn = document.getElementById('deleteSetBtn');
const quizBar = document.getElementById('quizBar');
const quizCount = document.getElementById('quizCount');
const quizBody = document.getElementById('quizBody');
const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const quizNextBtn = document.getElementById('quizNextBtn');
const quizResult = document.getElementById('quizResult');
const quizScore = document.getElementById('quizScore');
const quizComment = document.getElementById('quizComment');
const fileInput = document.getElementById('fileInput');
const uploadMsg = document.getElementById('uploadMsg');
const limitInput = document.getElementById('limitInput');
const shuffleInput = document.getElementById('shuffleInput');
const quizPrevBtn = document.getElementById('quizPrevBtn');
const quizMap = document.getElementById('quizMap');
const quizExplain = document.getElementById('quizExplain');
const explainTitle = document.getElementById('explainTitle');
const explainText = document.getElementById('explainText');
const quizReviewBtn = document.getElementById('quizReviewBtn');
const aiExplainBtn = document.getElementById('aiExplainBtn');
const aiNote = document.getElementById('aiNote');
const aiKeyInput = document.getElementById('aiKeyInput');
const aiRemember = document.getElementById('aiRemember');
const aiStatus = document.getElementById('aiStatus');
const aiModelInput = document.getElementById('aiModelInput');
const aiClearBtn = document.getElementById('aiClearBtn');

// Bộ đề có sẵn để thử ngay
const sampleSet = {
  name: 'Mẫu: Tài chính cơ bản',
  builtin: true,
  questions: [
    { q: 'ROE được tính bằng công thức nào?', options: ['Lợi nhuận sau thuế / Vốn chủ sở hữu', 'Lợi nhuận sau thuế / Tổng tài sản', 'Doanh thu / Tổng tài sản', 'Nợ phải trả / Vốn chủ sở hữu'], answer: 0, explain: 'ROE = Lợi nhuận sau thuế / Vốn chủ sở hữu, cho biết mỗi đồng vốn của cổ đông tạo ra bao nhiêu đồng lợi nhuận. Còn Lợi nhuận sau thuế / Tổng tài sản là ROA.' },
    { q: 'Tỷ số D/E đo lường điều gì?', options: ['Khả năng sinh lời', 'Mức độ sử dụng đòn bẩy tài chính', 'Khả năng thanh toán nhanh', 'Vòng quay hàng tồn kho'], answer: 1, explain: 'D/E = Nợ phải trả / Vốn chủ sở hữu. Tỷ số càng cao thì công ty càng dùng nhiều nợ để tài trợ, tức đòn bẩy tài chính càng lớn.' },
    { q: 'P/E cao thường cho thấy điều gì?', options: ['Cổ phiếu chắc chắn bị định giá thấp', 'Công ty sắp phá sản', 'Nhà đầu tư kỳ vọng tăng trưởng cao', 'Công ty không có lợi nhuận'], answer: 2, explain: 'P/E cao thường phản ánh nhà đầu tư sẵn sàng trả giá cao vì kỳ vọng lợi nhuận tăng mạnh trong tương lai. Nó không có nghĩa chắc chắn là rẻ hay công ty gặp khó khăn.' },
    { q: 'Lãi kép khác lãi đơn ở điểm nào?', options: ['Lãi suất luôn cao hơn', 'Lãi được cộng vào vốn để sinh lãi tiếp', 'Chỉ áp dụng cho nợ', 'Chỉ tính một lần'], answer: 1, explain: 'Với lãi kép, lãi của kỳ trước được cộng vào vốn nên kỳ sau sinh lãi trên cả vốn lẫn lãi. Lãi đơn chỉ tính trên vốn gốc ban đầu.' },
    { q: 'Đa dạng hóa danh mục nhằm mục đích gì?', options: ['Tăng chắc chắn lợi nhuận', 'Tránh đóng thuế', 'Giảm chi phí giao dịch', 'Giảm rủi ro khi một tài sản giảm giá'], answer: 3, explain: 'Khi vốn được chia vào nhiều tài sản khác nhau, thua lỗ ở một tài sản có thể được bù bởi tài sản khác. Đa dạng hóa giảm rủi ro riêng lẻ nhưng không đảm bảo có lợi nhuận.' }
  ]
};

// Bộ đề người dùng tải lên được lưu trong localStorage để lần sau còn
function loadUploadedSets() {
  try { return JSON.parse(localStorage.getItem('quizSets')) || []; } catch (e) { return []; }
}
function saveUploadedSets() {
  try { localStorage.setItem('quizSets', JSON.stringify(sets.filter(s => !s.builtin))); } catch (e) {}
}

let sets = [sampleSet, ...loadUploadedSets()];
let currentSet = 0, qIndex = 0;
let answers = []; // đáp án người dùng đã chọn cho từng câu (undefined = chưa làm)

// ----- Đọc file: chuyển nội dung file thành mảng câu hỏi -----
function isValid(item) {
  return item.q && item.options.length >= 2 && item.answer >= 0 && item.answer < item.options.length;
}

function parseJson(text) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.questions;
  return list.map((item) => {
    let answer = item.answer;
    if (typeof answer === 'string') answer = 'ABCD'.indexOf(answer.trim().toUpperCase()); // "B" -> 1
    return { q: String(item.q || item.question || ''), options: (item.options || []).map(String), answer: answer, explain: String(item.explain || item.explanation || '') };
  }).filter(isValid);
}

// Đổi 1 đoạn công thức LaTeX thành chữ dễ đọc, vd "\frac{a}{b} \times 2" -> "a/b × 2"
function latexToText(math) {
  const sub = '₀₁₂₃₄₅₆₇₈₉', sup = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const toUnicode = (digits, map) => digits.replace(/\d/g, (d) => map[Number(d)]);
  const wrap = (s) => /^[\w.,%$]+$/.test(s) ? s : '(' + s + ')';
  const symbols = { times: ' × ', cdot: ' · ', approx: ' ≈ ', Rightarrow: ' ⇒ ', Leftrightarrow: ' ⇔ ',
    leq: ' ≤ ', geq: ' ≥ ', neq: ' ≠ ', pm: ' ± ', dots: '…', ldots: '…', quad: ' ', qquad: ' ',
    left: '', right: '', Big: '', big: '', Bigg: '', bigg: '' };
  let r = math;
  for (let i = 0; i < 4; i++) {      // lặp vài lần để gỡ các lớp lồng nhau
    r = r.replace(/\\(?:text|textbf|mathbf|mathrm|mathit|operatorname)\s*\{([^{}]*)\}/g, '$1')
         .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (m, a, b) => wrap(a.trim()) + '/' + wrap(b.trim()));
  }
  r = r.replace(/\\([A-Za-z]+)/g, (m, cmd) => (cmd in symbols ? symbols[cmd] : cmd))   // \times -> ×
       .replace(/\\([%&_#{}])/g, '$1')                                                   // \% -> %
       .replace(/\\[,;! ]|\\\\/g, ' ')
       .replace(/_\{(\d+)\}|_(\d)/g, (m, a, b) => toUnicode(a || b, sub))                // D_1 -> D₁
       .replace(/_\{([^{}]*)\}/g, '_$1')
       .replace(/\^\{(\d+)\}|\^(\d)/g, (m, a, b) => toUnicode(a || b, sup))              // x^2 -> x²
       .replace(/\^\{([^{}]*)\}/g, '^($1)')
       .replace(/[{}]/g, '');
  return r.replace(/\s+/g, ' ').trim();
}

// Tìm các đoạn công thức $...$ hoặc $$...$$ trong văn bản và đổi sang chữ dễ đọc.
// Số tiền như $5,000 không bị ảnh hưởng (đoạn công thức luôn bắt đầu bằng chữ hoặc dấu \ ngay sau $).
function cleanMath(text) {
  const DOLLAR = '\u0002';
  return text
    .replace(/\\\$/g, DOLLAR)                                                  // \$ (ký hiệu đô la trong công thức) -> ký tự tạm
    .replace(/\$\$([\s\S]*?)\$\$/g, (m, math) => latexToText(math))             // $$ ... $$
    .replace(/\$([A-Za-z\\{(][^$]*?)\$/g, (m, math) => latexToText(math))       // $ ... $
    .replace(new RegExp(DOLLAR, 'g'), '$');                                     // trả lại ký hiệu $
}

// Đọc chữ từ file PDF bằng thư viện pdf.js (chạy ngay trên trình duyệt, không cần API key)
async function readPdfText(file) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  let text = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const content = await (await pdf.getPage(p)).getTextContent();

    // Mỗi mảnh chữ có tọa độ x, y. Ta gom các mảnh cùng độ cao thành 1 dòng rồi xếp theo x (trái -> phải),
    // vì PDF có thể lưu các ký hiệu toán (vd t = 4) ở thứ tự khác với thứ tự hiển thị.
    const items = content.items
      .filter((it) => it.str !== '')
      .map((it) => ({ s: it.str, x: it.transform[4], y: it.transform[5], w: it.width, h: it.height || 10 }));
    items.sort((a, b) => b.y - a.y || a.x - b.x);               // từ trên xuống dưới

    const rows = [];
    items.forEach((it) => {
      const row = rows[rows.length - 1];
      if (row && Math.abs(it.y - row.y) <= 0.55 * Math.max(it.h, row.h)) {   // đủ gần về chiều dọc = cùng dòng
        row.items.push(it);
        row.h = Math.max(row.h, it.h);
      } else {
        rows.push({ y: it.y, h: it.h, items: [it] });
      }
    });

    rows.forEach((row) => {
      row.items.sort((a, b) => a.x - b.x);
      let line = '', prevEnd = null;
      row.items.forEach((it) => {
        // Hai mảnh cách nhau đủ xa mà chưa có khoảng trắng thì chèn thêm 1 khoảng trắng
        if (prevEnd !== null && it.x - prevEnd > 0.2 * row.h && !line.endsWith(' ') && !it.s.startsWith(' ')) line += ' ';
        line += it.s;
        prevEnd = it.x + it.w;
      });
      text += line + '\n';
    });
    text += '\n';                                                // hết trang
  }
  return text;
}

// Đọc văn bản (từ .txt, .docx, .pdf) và TỰ LỌC ra các câu trắc nghiệm đã được định dạng sẵn.
// Phần không đúng khuôn (tiêu đề, công thức tóm tắt, câu tự luận...) sẽ tự bị bỏ qua.
function parseText(text) {
  const questions = [];
  let qLines = [], options = [], letters = [], boldIdx = [], answer = -1, answerLetter = '';
  let lastItem = null, inExplain = false;   // câu vừa chốt xong, và đang đọc dở lời giải của nó không
  let blockExplicit = false, skipped = 0;   // blockExplicit: đang đọc 1 mục có ghi "Câu N"/"Question N"; skipped: số mục bị bỏ qua

  // Chốt câu đang đọc dở rồi chuẩn bị đọc câu mới.
  // Đáp án lấy theo thứ tự ưu tiên: dòng "Đáp án" > đáp án duy nhất được in đậm.
  function finishQuestion() {
    if (answerLetter) {                       // đáp án ghi bằng chữ cái -> đổi sang vị trí trong danh sách
      const k = letters.indexOf(answerLetter);
      answer = k >= 0 ? k : 'ABCD'.indexOf(answerLetter);
    }
    if (answer < 0 && boldIdx.length === 1) answer = boldIdx[0];

    let q = qLines.join(' ').trim();
    const head = /^(?:câu hỏi|câu|question)\s*\d+\s*(?:\([^)]*\))?\s*[.:)]?\s*/i;   // "Câu 1 (Chapter 1):", "Question 2"
    q = head.test(q) ? q.replace(head, '') : q.replace(/^\d+\s*(?:\([^)]*\))?\s*[.:)](?=\s|$)\s*/, '');
    q = q.replace(/\(\s*soạn bởi[^)]*\)/i, '')    // bỏ "(Soạn bởi ...)"
         .replace(/\s*\[VI\]/g, '\n[VI]')          // phần tiếng Việt xuống dòng riêng
         .trim();

    const item = { q: q, options: options, answer: answer, explain: '' };
    if (isValid(item)) { questions.push(item); lastItem = item; }
    else { lastItem = null; if (blockExplicit) skipped++; }
    qLines = []; options = []; letters = []; boldIdx = []; answer = -1; answerLetter = '';
    blockExplicit = false; inExplain = false;
  }

  // Bỏ phần đang đọc dở nếu nó không phải câu trắc nghiệm (vd câu tự luận)
  function dropBlock() {
    if (blockExplicit && qLines.length && options.length === 0) skipped++;
    qLines = []; blockExplicit = false;
  }

  // Thêm 1 dòng vào lời giải của câu vừa chốt
  function addExplain(t) {
    lastItem.explain = lastItem.explain ? lastItem.explain + '\n' + t : t;
  }

  // Đọc lần lượt từng dòng, bỏ qua dòng trống
  const lines = cleanMath(text.normalize('NFC')).replace(/\r/g, '').split('\n');

  // Lấy dòng không trống kế tiếp (dùng để đoán một dòng thuộc câu hỏi, đáp án hay lời giải)
  function nextLine(i) {
    for (let k = i + 1; k < lines.length; k++) {
      const t = lines[k].replace(/\u0001/g, '').trim();
      if (t) return t;
    }
    return '';
  }

  lines.forEach((rawLine, idx) => {
    const bold = rawLine.startsWith('\u0001');            // dòng này có in đậm không
    const line = rawLine.replace(/\u0001/g, '').replace(/\*\*/g, '').trim()
      .replace(/^(?:(?:[●•◦▪○·]|[-*–—])\s+)+/, '').trim();     // bỏ dấu đầu dòng (●, •, *, -) và ** của markdown
    if (!line) return;

    // Tiêu đề phần / đường kẻ ngang: kết thúc câu hiện tại và bỏ phần không phải câu hỏi
    if (/^(?:#{1,6}\s|[-_=*]{3,}$|part\s+[ivx\d]+\b|phần\s+[ivx\d]+\b|section\s+[a-z\d]+\b)/i.test(line)) {
      if (options.length > 0) finishQuestion();
      dropBlock();
      lastItem = null; inExplain = false;
      return;
    }

    // "Đáp án: B", "Đáp án đúng: B", "Answer: B", "Answer / Đáp án: B", "=> Đáp án đúng: B"
    const ans = line.match(/^[=>\-–—*•\s]*(?:answer|đáp án|dap an)(?:\s*\/\s*(?:answer|đáp án|dap an))?(?:\s+(?:đúng|dung))?\s*[:：-]?\s*([A-D])\b/i);
    const inlineAns = options.length >= 2 && line.match(/^([A-D])\s*[(（]/);   // vd: "A ( giải thích )"
    let opt = line.match(/^([A-D])\s*[.)]\s*(.+)$/i);                           // "A. text", "A) text", "A . text"
    if (!opt && /^[A-D]\s+\S/.test(line)) {
      // Đáp án viết thiếu dấu chấm, vd "D 68.2% and 6.6%": chỉ nhận khi đúng thứ tự A, B, C, D.
      // Riêng "A ..." phải có dòng "B ..." ngay sau, để không nhầm với câu hỏi bắt đầu bằng "A company..."
      const letter = line[0];
      const startsList = options.length === 0 && /^B\s*[.)]?\s+\S/.test(nextLine(idx));
      if (letter === 'ABCD'[options.length] && (options.length > 0 || startsList)) {
        opt = [line, letter, line.slice(1).trim()];
      }
    }
    const label = '(?:step-by-step solution|answer guidelines|explanation|solution|lời giải(?: chi tiết)?|giải thích|hướng dẫn trả lời)';
    const explainLabel = new RegExp('^' + label + '(?:\\s*\\/\\s*' + label + ')?\\s*[:：-]\\s*', 'i');
    const explicitQ = /^(?:câu hỏi|câu|question)\s*\d+/i.test(line);             // "Câu 3", "Question 3"
    const bareQ = /^\d+\s*(?:\([^)]*\))?\s*[.:)](?=\s|$)/.test(line);                    // "3." hoặc "3)"
    // Dòng "1. ..." nằm trong lời giải là bước giải, không phải câu hỏi mới (trừ khi ngay sau là đáp án A)
    const isNewQuestion = explicitQ || (bareQ && !(lastItem && inExplain && !/^[A-D]\s*[.)]/.test(nextLine(idx))));

    if (ans || inlineAns) {
      answerLetter = (ans ? ans[1] : inlineAns[1]).toUpperCase();
      finishQuestion();
      // Dòng kiểu "A ( giải thích )": phần trong ngoặc chính là lời giải
      if (inlineAns && lastItem) lastItem.explain = line.replace(/^[A-D]\s*[(（]\s*/, '').replace(/[)）]\s*$/, '').trim();
    } else if (lastItem && explainLabel.test(line)) {
      const t = line.replace(explainLabel, '');               // "Lời giải chi tiết: ..." / "Explanation / Giải thích: ..."
      if (t) addExplain(t);
      inExplain = true;
    } else if (lastItem && inExplain && !isNewQuestion && (opt || !/^[A-D]\s*[.)]/.test(nextLine(idx)))) {
      addExplain(line);                                       // các dòng tiếp theo của lời giải
    } else if (opt) {
      lastItem = null; inExplain = false;
      options.push(opt[2]);
      letters.push(opt[1].toUpperCase());
      if (bold) boldIdx.push(options.length - 1);             // nhớ lại đáp án nào đang in đậm
    } else if (isNewQuestion) {
      if (options.length > 0) finishQuestion(); else dropBlock();   // câu cũ không có dòng Đáp án -> chốt luôn
      lastItem = null; inExplain = false;
      qLines = [line];                                        // bắt đầu câu mới
      blockExplicit = explicitQ;
    } else if (options.length > 0) {
      if (/^A\s*[.)]/i.test(nextLine(idx))) {                 // câu hỏi mới không đánh số, đáp án A xuất hiện ngay sau
        finishQuestion();
        lastItem = null;
        qLines = [line];
      } else {
        options[options.length - 1] += ' ' + line;           // dòng bị ngắt giữa chừng (hay gặp ở PDF): ghép vào đáp án trước
      }
    } else {
      lastItem = null; inExplain = false;
      qLines.push(line);                                      // câu hỏi viết nhiều dòng
    }
  });

  if (options.length > 0) finishQuestion(); else dropBlock();   // câu cuối cùng
  questions.skipped = skipped;                                  // số mục bị tự động bỏ qua
  return questions;
}

function showMessage(text, isError) {
  uploadMsg.textContent = text;
  uploadMsg.classList.toggle('error', isError);
}

// Bỏ thẻ HTML và đổi ký tự đặc biệt (&amp; ...) về chữ thường
function htmlToPlain(html) {
  const noTags = html.replace(/<[^>]+>/g, '');
  return new DOMParser().parseFromString(noTags, 'text/html').body.textContent;
}

// Đổi HTML (do mammoth tạo ra) thành chữ thường, giữ lại xuống dòng VÀ đánh dấu dòng in đậm.
// - Trong Word, 4 đáp án thường nằm chung 1 đoạn, ngăn cách bằng Shift+Enter (thẻ <br>).
// - Dòng nào gần như toàn bộ chữ in đậm (thẻ <strong>) sẽ được gắn ký tự \u0001 ở đầu,
//   để parseText biết đó có thể là đáp án đúng.
function htmlToText(html) {
  const countChars = (s) => s.replace(/\s/g, '').length;
  return html
    .replace(/<br\s*\/?>/gi, '\n')            // <br> = xuống dòng
    .replace(/<\/(p|li|h\d)>/gi, '\n')        // hết đoạn = xuống dòng
    .split('\n')
    .map((lineHtml) => {
      const plain = htmlToPlain(lineHtml);
      if (!plain.trim()) return '';
      const boldHtml = (lineHtml.match(/<strong>.*?<\/strong>/gi) || []).join('');
      const isBold = countChars(htmlToPlain(boldHtml)) >= 0.8 * countChars(plain);
      return (isBold ? '\u0001' : '') + plain;
    })
    .join('\n');
}

// Thêm bộ đề mới vào danh sách sau khi đã đọc xong file
function addSet(file, questions) {
  if (questions.length === 0) {
    showMessage('Không đọc được câu hỏi nào. Kiểm tra lại định dạng file mẫu.', true);
    return;
  }
  const name = file.name.replace(/\.\w+$/, '');
  const newSet = { name: name, questions: questions, v: 2 };   // v: 2 = bộ đề đã lưu kèm lời giải
  const old = sets.findIndex((s) => !s.builtin && s.name === name);
  if (old >= 0) sets[old] = newSet;                            // trùng tên: cập nhật bản cũ
  else sets.push(newSet);
  saveUploadedSets();
  currentSet = old >= 0 ? old : sets.length - 1;
  renderSetSelect();
  startQuiz();
  const withExplain = questions.filter((q) => q.explain).length;
  showMessage((old >= 0 ? 'Đã cập nhật ' : 'Đã thêm ') + questions.length + ' câu hỏi từ "' + file.name + '". ' +
    'Cả ' + questions.length + ' câu đều xác định được đáp án đúng; ' + withExplain + ' câu có lời giải chi tiết.' +
    (questions.skipped ? ' Đã bỏ qua ' + questions.skipped + ' mục (không đủ đáp án A-D hoặc không xác định được đáp án đúng).' : ''), false);
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf')) {
    // File PDF: dùng thư viện pdf.js lấy chữ ra (chỉ đọc được PDF có chữ, PDF scan thành ảnh thì chưa đọc được)
    if (typeof pdfjsLib === 'undefined') {
      showMessage('Chưa tải được thư viện đọc PDF. Kiểm tra mạng rồi thử lại.', true);
    } else {
      readPdfText(file)
        .then((text) => {
          if (text.replace(/\s/g, '').length < 20) showMessage('PDF này không có chữ (có thể là file scan thành ảnh).', true);
          else addSet(file, parseText(text));
        })
        .catch(() => showMessage('Không đọc được file PDF này.', true));
    }
    fileInput.value = '';
    return;
  }

  if (name.endsWith('.docx')) {
    // File Word: dùng thư viện mammoth lấy phần chữ ra, rồi đọc như file .txt
    if (typeof mammoth === 'undefined') {
      showMessage('Chưa tải được thư viện đọc Word. Kiểm tra mạng rồi thử lại.', true);
    } else {
      file.arrayBuffer()
        .then((buffer) => mammoth.convertToHtml({ arrayBuffer: buffer }))
        .then((result) => addSet(file, parseText(htmlToText(result.value))))
        .catch(() => showMessage('Không đọc được file Word này.', true));
    }
    fileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      addSet(file, name.endsWith('.json') ? parseJson(reader.result) : parseText(reader.result));
    } catch (e) {
      showMessage('File bị lỗi định dạng, không đọc được.', true);
    }
    fileInput.value = ''; // cho phép chọn lại cùng 1 file
  };
  reader.readAsText(file, 'UTF-8');
});

// ----- Hiển thị và làm bài -----
function renderSetSelect() {
  setSelect.innerHTML = '';
  sets.forEach((s, i) => {
    const option = document.createElement('option');
    option.value = i;
    const outdated = !s.builtin && !s.v;                      // bộ đề cũ, lưu trước khi có lời giải
    option.textContent = s.name + ' (' + s.questions.length + ' câu)' + (outdated ? ' ⚠ bản cũ, chưa có lời giải' : '');
    setSelect.appendChild(option);
  });
  setSelect.value = currentSet;
  limitInput.value = '';                                       // trống = làm tất cả
  limitInput.placeholder = 'Tất cả ' + sets[currentSet].questions.length;
  deleteSetBtn.hidden = !!sets[currentSet].builtin; // không cho xóa bộ đề mẫu
}

let activeQuestions = []; // các câu sẽ làm trong lần này (đã giới hạn số câu / trộn)
let activeOrder = [];     // vị trí của các câu đó trong bộ đề gốc (để lưu và khôi phục tiến độ)

// ----- Lưu tiến độ riêng cho từng bộ đề (kể cả khi chuyển bộ đề khác hoặc tải lại trang) -----
function loadProgress() {
  try { return JSON.parse(localStorage.getItem('quizProgress')) || {}; } catch (e) { return {}; }
}
const progressStore = loadProgress();   // dạng { "tên bộ đề": {tiến độ}, ... }

function saveProgress() {
  const set = sets[currentSet];
  progressStore[set.name] = {
    total: set.questions.length,                                           // để biết bộ đề có bị thay đổi không
    order: activeOrder,
    answers: Array.from({ length: activeOrder.length }, (_, k) => answers[k] === undefined ? null : answers[k]),
    qIndex: qIndex,
    limit: limitInput.value,
    shuffle: shuffleInput.checked,
    done: !quizResult.hidden                                               // đang ở màn hình kết quả không
  };
  progressStore._last = set.name;                                          // nhớ bộ đề đang làm dở
  try { localStorage.setItem('quizProgress', JSON.stringify(progressStore)); } catch (e) {}
}

// Mở 1 bộ đề: nếu từng làm dở thì khôi phục đúng chỗ đó, chưa làm thì bắt đầu mới
function openSet() {
  const set = sets[currentSet];
  const saved = progressStore[set.name];
  const valid = saved && saved.total === set.questions.length && Array.isArray(saved.order) &&
    saved.order.length > 0 && saved.order.every((i) => i < set.questions.length) && Array.isArray(saved.answers);
  if (!valid) { startQuiz(); return; }

  limitInput.value = saved.limit;
  shuffleInput.checked = !!saved.shuffle;
  activeOrder = saved.order;
  activeQuestions = activeOrder.map((i) => set.questions[i]);
  answers = saved.answers.map((a) => a === null ? undefined : a);
  qIndex = Math.min(saved.qIndex || 0, activeQuestions.length - 1);
  if (saved.done) showResult(); else showQuestion();
}

// Bắt đầu làm MỚI (xóa tiến độ cũ của bộ đề này)
function startQuiz() {
  const all = sets[currentSet].questions;

  // Số câu muốn làm: để trống = tất cả, và không vượt quá số câu có trong bộ đề
  let limit = parseInt(limitInput.value) || all.length;
  limit = Math.max(1, Math.min(limit, all.length));
  if (limitInput.value !== '') limitInput.value = limit;

  const pool = all.map((q, i) => i);   // danh sách vị trí 0, 1, 2, ... của các câu
  if (shuffleInput.checked) {
    for (let i = pool.length - 1; i > 0; i--) {  // trộn kiểu Fisher-Yates
      const k = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[k]] = [pool[k], pool[i]];
    }
  }
  activeOrder = pool.slice(0, limit);            // lấy `limit` câu đầu tiên
  activeQuestions = activeOrder.map((i) => all[i]);

  qIndex = 0;
  answers = [];
  quizResult.hidden = true;
  quizBody.hidden = false;
  showQuestion();
}

limitInput.addEventListener('change', startQuiz);
shuffleInput.addEventListener('change', startQuiz);

function showQuestion() {
  const item = activeQuestions[qIndex];
  const chosen = answers[qIndex];                       // undefined = chưa trả lời câu này
  const total = activeQuestions.length;
  const answered = answers.filter((a) => a !== undefined).length;
  const right = answers.filter((a, i) => a === activeQuestions[i].answer).length;

  quizBody.hidden = false;
  quizResult.hidden = true;
  quizCount.textContent = 'Câu ' + (qIndex + 1) + '/' + total + ' · Đã làm ' + answered + ' · Đúng ' + right;
  quizBar.style.width = (answered / total * 100) + '%';
  quizQuestion.textContent = item.q;
  quizOptions.innerHTML = '';

  item.options.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.className = 'opt';
    const letter = document.createElement('span');
    letter.className = 'letter';
    letter.textContent = 'ABCD'[i];
    const label = document.createElement('span');
    label.textContent = text;
    btn.append(letter, label);
    btn.addEventListener('click', () => chooseAnswer(i));
    quizOptions.appendChild(btn);
  });

  quizPrevBtn.disabled = qIndex === 0;
  quizNextBtn.textContent = qIndex === total - 1 ? 'Xem kết quả' : 'Câu tiếp →';

  if (chosen === undefined) {          // chưa làm: ẩn lời giải và nút "Câu tiếp"
    quizExplain.hidden = true;
    quizNextBtn.hidden = true;
  } else {                             // đã làm (kể cả khi quay lại xem): hiện đáp án và lời giải
    revealAnswer(chosen);
  }
  renderMap(true);
  saveProgress();
}

// Hiện đáp án đúng/sai và lời giải cho câu hiện tại
function revealAnswer(chosen) {
  const item = activeQuestions[qIndex];
  const correct = item.answer;

  quizOptions.querySelectorAll('.opt').forEach((b, i) => {
    b.disabled = true;                                  // khóa, không cho chọn lại
    if (i === correct) b.classList.add('correct');      // luôn tô xanh đáp án đúng
    else if (i === chosen) b.classList.add('wrong');    // tô đỏ nếu chọn sai
    if (i === chosen) {                                 // ghi chú "Bạn chọn" để xem lại cho rõ
      const tag = document.createElement('span');
      tag.className = 'you';
      tag.textContent = 'Bạn chọn';
      b.appendChild(tag);
    }
  });

  const isRight = chosen === correct;
  quizExplain.hidden = false;
  quizExplain.className = 'explain ' + (isRight ? 'good' : 'bad');
  explainTitle.textContent = isRight ? '✓ Chính xác!' : '✗ Chưa đúng. Đáp án đúng là ' + 'ABCD'[correct];
  // Dùng lời giải trong file; nếu file không có thì chỉ nêu đáp án đúng
  const cur = sets[currentSet];
  const outdated = !cur.builtin && !cur.v;
  explainText.textContent = item.explain ||
    ('Đáp án đúng: ' + 'ABCD'[correct] + '. ' + item.options[correct] + '\n' +
     (outdated ? '(Bộ đề này được lưu từ trước khi có lời giải. Hãy bấm "Xóa bộ đề" rồi tải lại file, hoặc tải lại đúng tên file để cập nhật.)'
               : '(Đáp án này lấy từ chữ in đậm/đỏ hoặc dòng đáp án trong file. File không có lời giải chi tiết cho câu này.)'));

  // Nút AI chỉ hiện ở câu chưa có lời giải; câu có lời giải do AI viết thì hiện ghi chú
  aiExplainBtn.hidden = !!item.explain;
  aiExplainBtn.disabled = false;
  aiExplainBtn.textContent = '🤖 Tạo lời giải bằng AI';
  aiNote.hidden = !item.ai;
  aiNote.textContent = item.ai ? '🤖 Lời giải do AI tạo, có thể chưa chính xác. Hãy đối chiếu giáo trình.' : '';
  quizNextBtn.hidden = false;
}

// Bản đồ câu hỏi: mỗi câu là 1 ô vuông, xanh = đúng, đỏ = sai, bấm vào để xem lại
function renderMap(markCurrent) {
  quizMap.innerHTML = '';
  const firstOpen = activeQuestions.findIndex((q, k) => answers[k] === undefined); // câu đầu tiên chưa làm
  activeQuestions.forEach((q, i) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = i + 1;
    if (answers[i] !== undefined) chip.classList.add(answers[i] === q.answer ? 'right' : 'wrong');
    if (markCurrent && i === qIndex) chip.classList.add('current');
    chip.disabled = firstOpen !== -1 && i > firstOpen;  // chưa làm tới thì chưa vào được
    chip.addEventListener('click', () => { qIndex = i; showQuestion(); });
    quizMap.appendChild(chip);
  });
}

function chooseAnswer(chosen) {
  if (answers[qIndex] !== undefined) return;            // đã trả lời rồi thì không đổi được
  answers[qIndex] = chosen;
  showQuestion();                                       // vẽ lại ở trạng thái "đã trả lời"
}

function showResult() {
  const total = activeQuestions.length;
  const score = answers.filter((a, i) => a === activeQuestions[i].answer).length;
  const percent = Math.round(score / total * 100);
  quizBody.hidden = true;
  quizResult.hidden = false;
  quizBar.style.width = '100%';
  quizCount.textContent = 'Hoàn thành bộ đề';
  quizScore.textContent = score + '/' + total;
  quizComment.textContent = percent >= 80 ? 'Xuất sắc! Bạn nắm bài rất chắc 🎉' : percent >= 50 ? 'Khá tốt, ôn thêm vài câu sai là ổn 👍' : 'Cần ôn lại thêm, thử làm lại nhé 💪';
  renderMap(false);
  saveProgress();
}

quizNextBtn.addEventListener('click', () => {
  if (qIndex >= activeQuestions.length - 1) showResult();
  else { qIndex++; showQuestion(); }
});
quizPrevBtn.addEventListener('click', () => {
  if (qIndex > 0) { qIndex--; showQuestion(); }
});
quizReviewBtn.addEventListener('click', () => { qIndex = 0; showQuestion(); });
document.getElementById('quizRetryBtn').addEventListener('click', startQuiz);

setSelect.addEventListener('change', () => {
  currentSet = Number(setSelect.value);
  renderSetSelect();
  openSet();                 // làm dở bộ nào thì quay lại đúng chỗ đó
});

deleteSetBtn.addEventListener('click', () => {
  delete progressStore[sets[currentSet].name];   // xóa luôn tiến độ của bộ đề này
  sets.splice(currentSet, 1);
  saveUploadedSets();
  currentSet = 0;
  renderSetSelect();
  openSet();
});


// =====================================================
// 7. LỜI GIẢI BẰNG AI (người dùng tự dán API key)
// =====================================================
// Key chỉ nằm trong trình duyệt của bạn, gửi thẳng tới hãng AI, không nằm trong file code.
const defaultModels = { claude: 'claude-haiku-5-5', gemini: 'gemini-flash-latest' };
let aiKey = '';
try { aiKey = localStorage.getItem('aiKey') || ''; } catch (e) {}

// Đoán hãng AI theo đầu của key
function detectProvider(key) {
  if (/^sk-ant-/.test(key)) return 'claude';
  if (/^AIza/.test(key)) return 'gemini';
  if (/^sk-/.test(key)) return 'unsupported';   // OpenAI và một số hãng khác không cho gọi trực tiếp từ trình duyệt
  return key ? 'unknown' : '';
}

function updateAiStatus() {
  const provider = detectProvider(aiKey);
  aiModelInput.placeholder = 'mặc định: ' + (defaultModels[provider] || '...');
  aiStatus.classList.toggle('error', provider === 'unsupported' || provider === 'unknown');
  aiStatus.textContent = {
    '': 'Chưa có key.',
    claude: '✓ Nhận ra key Claude (model mặc định ' + defaultModels.claude + ').',
    gemini: '✓ Nhận ra key Gemini (model mặc định ' + defaultModels.gemini + ').',
    unsupported: 'Key OpenAI và một số hãng khác không gọi trực tiếp từ trình duyệt được (cần có máy chủ trung gian). Hãy dùng key Claude hoặc Gemini.',
    unknown: 'Chưa nhận ra loại key này. App hỗ trợ key Claude (sk-ant-...) và Gemini (AIza...).'
  }[provider];
}

function saveAiKey() {
  try {
    if (aiRemember.checked && aiKey) localStorage.setItem('aiKey', aiKey);
    else localStorage.removeItem('aiKey');
  } catch (e) {}
}

aiKeyInput.value = aiKey;
aiRemember.checked = !!aiKey;
updateAiStatus();
aiKeyInput.addEventListener('input', () => { aiKey = aiKeyInput.value.trim(); updateAiStatus(); saveAiKey(); });
aiRemember.addEventListener('change', saveAiKey);
aiClearBtn.addEventListener('click', () => { aiKey = ''; aiKeyInput.value = ''; aiRemember.checked = false; saveAiKey(); updateAiStatus(); });

// Gửi câu hỏi tới AI và nhận lại đoạn chữ lời giải
async function askAI(provider, prompt) {
  const model = aiModelInput.value.trim() || defaultModels[provider];

  if (provider === 'claude') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': aiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'     // bắt buộc khi gọi từ trình duyệt
      },
      body: JSON.stringify({ model: model, max_tokens: 2000, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json();
    if (!res.ok) throw new Error((data.error && data.error.message) || ('Lỗi ' + res.status));
    // Kết quả có thể gồm nhiều khối (kể cả khối "thinking"), ta chỉ lấy các khối chữ
    return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  }

  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': aiKey },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data.error && data.error.message) || ('Lỗi ' + res.status));
  const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
  return (parts || []).map((p) => p.text || '').join('');
}

function showAiNote(text) {
  aiNote.hidden = false;
  aiNote.textContent = text;
}

// Bấm nút "Tạo lời giải bằng AI" ở câu chưa có lời giải
aiExplainBtn.addEventListener('click', async () => {
  const idx = qIndex;
  const item = activeQuestions[idx];
  const chosen = answers[idx];
  const provider = detectProvider(aiKey);

  if (!provider) { showAiNote('Hãy dán API key vào khung "Lời giải bằng AI" ở cột bên trái trước.'); aiKeyInput.focus(); return; }
  if (provider === 'unsupported' || provider === 'unknown') { showAiNote(aiStatus.textContent); return; }

  const prompt =
    'Bạn là gia sư môn kinh tế - tài chính. Hãy viết lời giải ngắn gọn bằng tiếng Việt (giữ nguyên thuật ngữ tiếng Anh) cho câu trắc nghiệm sau.\n\n' +
    'Câu hỏi: ' + item.q + '\n' +
    item.options.map((o, i) => 'ABCD'[i] + '. ' + o).join('\n') + '\n\n' +
    'Đáp án đúng theo đề: ' + 'ABCD'[item.answer] + '. ' + item.options[item.answer] + '\n' +
    (chosen !== item.answer ? 'Người học đã chọn: ' + 'ABCD'[chosen] + ' (sai).\n' : '') +
    '\nYêu cầu: (1) giải thích vì sao đáp án đúng là đúng, nếu có tính toán thì ghi từng bước ngắn gọn; ' +
    '(2) nếu người học chọn sai, nói ngắn gọn vì sao đáp án đã chọn sai; (3) tối đa 120 từ; ' +
    '(4) chỉ dùng chữ thường, không dùng markdown hay LaTeX; ' +
    '(5) nếu đáp án theo đề có vẻ không khớp với phép tính hoặc kiến thức đúng, hãy nói rõ điều đó.';

  aiExplainBtn.disabled = true;
  aiExplainBtn.textContent = 'Đang tạo lời giải...';
  aiNote.hidden = true;
  try {
    const text = (await askAI(provider, prompt)).trim();
    if (!text) throw new Error('AI không trả về nội dung.');
    item.explain = text;                 // lưu vào bộ đề để lần sau không phải gọi lại
    item.ai = true;
    saveUploadedSets();
    if (qIndex === idx) {                // chỉ cập nhật màn hình nếu người dùng vẫn đang ở câu này
      explainText.textContent = text;
      aiExplainBtn.hidden = true;
      showAiNote('🤖 Lời giải do AI tạo, có thể chưa chính xác. Hãy đối chiếu giáo trình.');
    }
  } catch (e) {
    aiExplainBtn.disabled = false;
    aiExplainBtn.textContent = '🤖 Tạo lời giải bằng AI';
    const msg = String(e && e.message || e);
    showAiNote(e instanceof TypeError
      ? 'Không gọi được tới dịch vụ AI. Nếu bạn đang xem bản chạy thử trên claude.ai thì trang này bị chặn gọi ra ngoài: hãy mở file index.html trên máy. Cũng có thể do mạng hoặc key sai.'
      : 'Lỗi từ dịch vụ AI: ' + msg);
  }
});

// Mở lại đúng bộ đề đang làm dở lần trước
const lastIndex = sets.findIndex((s) => s.name === progressStore._last);
if (lastIndex >= 0) currentSet = lastIndex;
renderSetSelect();
openSet();