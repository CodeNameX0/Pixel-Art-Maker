// 전역 변수들
let canvas, ctx;
let gridSize = 20;
let pixelSize = 20;
let currentColor = '#000000';
let isDrawing = false;
let eraserMode = false;

// 픽셀 데이터 저장
let pixels = {};

// 히스토리 관리
let history = [];
let historyIndex = -1;
const maxHistorySize = 50;

// 초기화 함수
function init() {
    console.log('픽셀아트 메이커 초기화 시작');
    
    canvas = document.getElementById('pixelCanvas');
    if (!canvas) {
        console.error('캔버스를 찾을 수 없습니다!');
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    // 캔버스 크기 설정
    canvas.width = gridSize * pixelSize;
    canvas.height = gridSize * pixelSize;
    
    // 초기 그리드 그리기
    drawGrid();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 초기 상태 저장
    saveState();
    
    console.log('픽셀아트 메이커 초기화 완료');
}

// 그리드 그리기 - 더 간단하고 확실한 방법
function drawGrid() {
    console.log('drawGrid 함수 호출됨');
    
    // 캔버스 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 배경을 흰색으로 채우기
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 저장된 픽셀들 그리기
    for (const key in pixels) {
        const [x, y] = key.split(',').map(Number);
        ctx.fillStyle = pixels[key];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
    
    // 그리드 라인 그리기 - 더 진한 색으로 변경
    ctx.strokeStyle = '#333';  // 더 진한 색으로 변경
    ctx.lineWidth = 1;
    
    // 세로 라인들
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * pixelSize + 0.5, 0);  // 0.5 추가로 선명하게
        ctx.lineTo(i * pixelSize + 0.5, canvas.height);
        ctx.stroke();
    }
    
    // 가로 라인들
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * pixelSize + 0.5);  // 0.5 추가로 선명하게
        ctx.lineTo(canvas.width, i * pixelSize + 0.5);
        ctx.stroke();
    }
    
    console.log('그리드 그리기 완료, 픽셀 수:', Object.keys(pixels).length);
}

// 픽셀 좌표 계산
function getPixelCoords(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / pixelSize);
    const y = Math.floor((event.clientY - rect.top) / pixelSize);
    return { x, y };
}

// 픽셀 그리기 - 더 확실한 방법
function drawPixel(x, y, color = null) {
    console.log(`drawPixel 호출: x=${x}, y=${y}, color=${color || currentColor}`);
    
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
        console.log('범위 밖의 좌표입니다.');
        return;
    }
    
    const key = `${x},${y}`;
    
    if (eraserMode || color === null) {
        delete pixels[key];
        console.log(`픽셀 삭제: (${x}, ${y})`);
    } else {
        pixels[key] = color || currentColor;
        console.log(`픽셀 추가: (${x}, ${y}) = ${pixels[key]}`);
    }
    
    // 즉시 해당 픽셀만 그리기 (성능 향상)
    if (pixels[key]) {
        ctx.fillStyle = pixels[key];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    } else {
        // 픽셀 지우기
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        
        // 그리드 라인 다시 그리기
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        // 해당 픽셀 영역의 그리드 라인 복원
        ctx.beginPath();
        ctx.moveTo(x * pixelSize + 0.5, y * pixelSize);
        ctx.lineTo(x * pixelSize + 0.5, (y + 1) * pixelSize);
        ctx.moveTo(x * pixelSize, y * pixelSize + 0.5);
        ctx.lineTo((x + 1) * pixelSize, y * pixelSize + 0.5);
        ctx.moveTo((x + 1) * pixelSize + 0.5, y * pixelSize);
        ctx.lineTo((x + 1) * pixelSize + 0.5, (y + 1) * pixelSize);
        ctx.moveTo(x * pixelSize, (y + 1) * pixelSize + 0.5);
        ctx.lineTo((x + 1) * pixelSize, (y + 1) * pixelSize + 0.5);
        ctx.stroke();
    }
    
    console.log('픽셀 그리기 완료');
}

// 이벤트 리스너 설정 - 더 간단하고 확실한 방법
function setupEventListeners() {
    console.log('이벤트 리스너 설정 시작');
    
    // 캔버스 마우스 이벤트 - 더 직접적인 방법
    canvas.onmousedown = function(e) {
        console.log('마우스 다운!');
        e.preventDefault();
        isDrawing = true;
        
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / pixelSize);
        const y = Math.floor((e.clientY - rect.top) / pixelSize);
        
        console.log(`클릭 좌표: (${x}, ${y}), 캔버스 크기: ${canvas.width}x${canvas.height}`);
        
        if (eraserMode) {
            drawPixel(x, y, null);
        } else {
            drawPixel(x, y, currentColor);
        }
    };
    
    canvas.onmousemove = function(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / pixelSize);
        const y = Math.floor((e.clientY - rect.top) / pixelSize);
        
        if (eraserMode) {
            drawPixel(x, y, null);
        } else {
            drawPixel(x, y, currentColor);
        }
    };
    
    canvas.onmouseup = function() {
        console.log('마우스 업!');
        if (isDrawing) {
            saveState();
        }
        isDrawing = false;
    };
    
    canvas.onmouseleave = function() {
        if (isDrawing) {
            saveState();
        }
        isDrawing = false;
    };
    
    // 우클릭 방지
    canvas.oncontextmenu = function(e) {
        e.preventDefault();
        return false;
    };
    
    console.log('캔버스 이벤트 리스너 설정 완료');
    
    // 컨트롤 이벤트들
    setupControlEvents();
}

// 컨트롤 이벤트 설정
function setupControlEvents() {
    const gridSizeInput = document.getElementById('gridSize');
    if (gridSizeInput) {
        gridSizeInput.addEventListener('change', (e) => {
            gridSize = parseInt(e.target.value);
            pixels = {};
            canvas.width = gridSize * pixelSize;
            canvas.height = gridSize * pixelSize;
            drawGrid();
            saveState();
        });
    }
    
    const createGridBtn = document.getElementById('createGrid');
    if (createGridBtn) {
        createGridBtn.addEventListener('click', () => {
            gridSize = parseInt(document.getElementById('gridSize').value);
            pixels = {};
            canvas.width = gridSize * pixelSize;
            canvas.height = gridSize * pixelSize;
            drawGrid();
            saveState();
        });
    }
    
    const colorPicker = document.getElementById('colorPicker');
    if (colorPicker) {
        colorPicker.addEventListener('change', (e) => {
            currentColor = e.target.value;
            const hexInput = document.getElementById('hexInput');
            if (hexInput) hexInput.value = e.target.value;
            eraserMode = false;
            updateEraserButton();
        });
    }
    
    const hexInput = document.getElementById('hexInput');
    if (hexInput) {
        hexInput.addEventListener('input', (e) => {
            const hex = e.target.value;
            if (isValidHex(hex)) {
                currentColor = hex;
                const colorPicker = document.getElementById('colorPicker');
                if (colorPicker) colorPicker.value = hex;
                eraserMode = false;
                updateEraserButton();
            }
        });
        
        hexInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const applyBtn = document.getElementById('applyHex');
                if (applyBtn) applyBtn.click();
            }
        });
    }
    
    const applyHexBtn = document.getElementById('applyHex');
    if (applyHexBtn) {
        applyHexBtn.addEventListener('click', () => {
            const hex = document.getElementById('hexInput').value;
            if (isValidHex(hex)) {
                currentColor = hex;
                const colorPicker = document.getElementById('colorPicker');
                if (colorPicker) colorPicker.value = hex;
                eraserMode = false;
                updateEraserButton();
            } else {
                alert('올바른 헥스 코드를 입력하세요 (예: #FF0000)');
            }
        });
    }
    
    const eraserBtn = document.getElementById('eraser');
    if (eraserBtn) {
        eraserBtn.addEventListener('click', () => {
            eraserMode = !eraserMode;
            updateEraserButton();
        });
    }
    
    const clearBtn = document.getElementById('clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('모든 픽셀을 지우시겠습니까?')) {
                pixels = {};
                drawGrid();
                saveState();
            }
        });
    }
    
    const undoBtn = document.getElementById('undo');
    if (undoBtn) {
        undoBtn.addEventListener('click', undo);
    }
    
    const redoBtn = document.getElementById('redo');
    if (redoBtn) {
        redoBtn.addEventListener('click', redo);
    }
    
    const saveBtn = document.getElementById('save');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveImage);
    }
    
    // 키보드 단축키
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey) {
            if (e.key === 'z' || e.key === 'Z') {
                e.preventDefault();
                undo();
            } else if (e.key === 'y' || e.key === 'Y') {
                e.preventDefault();
                redo();
            }
        }
    });
}

// 헥스 코드 유효성 검사
function isValidHex(hex) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

// 지우개 버튼 상태 업데이트
function updateEraserButton() {
    const eraserBtn = document.getElementById('eraser');
    if (eraserBtn) {
        if (eraserMode) {
            eraserBtn.classList.add('active');
            eraserBtn.textContent = '그리기 모드';
        } else {
            eraserBtn.classList.remove('active');
            eraserBtn.textContent = '지우개';
        }
    }
}

// 상태 저장
function saveState() {
    history = history.slice(0, historyIndex + 1);
    history.push(JSON.stringify(pixels));
    historyIndex++;
    
    if (history.length > maxHistorySize) {
        history.shift();
        historyIndex--;
    }
}

// 실행 취소
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        pixels = JSON.parse(history[historyIndex]);
        drawGrid();
    }
}

// 다시 실행
function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        pixels = JSON.parse(history[historyIndex]);
        drawGrid();
    }
}

// 이미지 저장
function saveImage() {
    const saveBtn = document.getElementById('save');
    if (!saveBtn) return;
    
    const originalText = saveBtn.textContent;
    
    saveBtn.textContent = '저장 중...';
    saveBtn.classList.add('loading');
    
    // 그리드 없는 깔끔한 이미지 생성
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = gridSize * pixelSize;
    tempCanvas.height = gridSize * pixelSize;
    
    // 배경을 흰색으로 채우기
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // 픽셀들만 그리기 (그리드 제외)
    for (const key in pixels) {
        const [x, y] = key.split(',').map(Number);
        tempCtx.fillStyle = pixels[key];
        tempCtx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
    
    // 다운로드
    const link = document.createElement('a');
    link.download = `pixel-art-${new Date().getTime()}.png`;
    link.href = tempCanvas.toDataURL();
    link.click();
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.classList.remove('loading');
    }, 2000);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료');
    init();
});

// 그리드 토글 함수 추가
function toggleGrid() {
    const gridBtn = document.getElementById('toggleGrid');
    if (gridBtn) {
        // 그리드 표시/숨김 기능을 원한다면 여기에 구현
        drawGrid();
    }
}
