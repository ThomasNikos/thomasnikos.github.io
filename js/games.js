// Snake Game Implementation
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Speed and timing
        this.baseSpeed = 200; // milliseconds between moves
        this.currentSpeed = this.baseSpeed;
        this.lastMoveTime = 0;
        
        // UI elements
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.levelElement = document.getElementById('level');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.startOverlay = document.getElementById('startOverlay');
        
        // Load high score
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.highScoreElement.textContent = this.highScore;
        
        this.initializeGame();
        this.setupEventListeners();
        this.generateFood();
        this.draw();
    }
    
    initializeGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.currentSpeed = this.baseSpeed;
        this.gameRunning = false;
        this.gamePaused = false;
        this.updateUI();
        this.generateFood();
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            // Prevent default behavior for game keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
            
            switch (e.key.toLowerCase()) {
                case 'arrowup':
                case 'w':
                    if (this.dy !== 1) { this.dx = 0; this.dy = -1; }
                    break;
                case 'arrowdown':
                case 's':
                    if (this.dy !== -1) { this.dx = 0; this.dy = 1; }
                    break;
                case 'arrowleft':
                case 'a':
                    if (this.dx !== 1) { this.dx = -1; this.dy = 0; }
                    break;
                case 'arrowright':
                case 'd':
                    if (this.dx !== -1) { this.dx = 1; this.dy = 0; }
                    break;
            }
        });
        
        // Button controls
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        
        // Pause/unpause with spacebar
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameRunning) {
                e.preventDefault();
                this.togglePause();
            }
        });
    }
    
    startGame() {
        this.startOverlay.classList.add('hidden');
        this.gameRunning = true;
        this.dx = 1; // Start moving right
        this.dy = 0;
        this.lastMoveTime = performance.now();
        this.gameLoop();
    }
    
    restartGame() {
        this.gameOverOverlay.classList.add('hidden');
        this.initializeGame();
        this.startGame();
    }
    
    newGame() {
        this.initializeGame();
        this.startOverlay.classList.remove('hidden');
        this.draw();
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.gamePaused) {
            pauseBtn.innerHTML = '<i class="fas fa-play mr-2"></i>Resume';
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause mr-2"></i>Pause';
            this.lastMoveTime = performance.now();
            this.gameLoop();
        }
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
    }
    
    updateGame() {
        // Move snake head
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10 * this.level;
            this.updateLevel();
            this.generateFood();
        } else {
            this.snake.pop();
        }
        
        this.updateUI();
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            // Increase speed with each level
            this.currentSpeed = Math.max(50, this.baseSpeed - (this.level - 1) * 15);
        }
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        this.gameOverOverlay.classList.remove('hidden');
    }
    
    draw() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#f8fafc');
        gradient.addColorStop(1, '#e2e8f0');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Snake head - blue gradient
                const headGradient = this.ctx.createRadialGradient(
                    segment.x * this.gridSize + this.gridSize / 2,
                    segment.y * this.gridSize + this.gridSize / 2,
                    0,
                    segment.x * this.gridSize + this.gridSize / 2,
                    segment.y * this.gridSize + this.gridSize / 2,
                    this.gridSize / 2
                );
                headGradient.addColorStop(0, '#3b82f6');
                headGradient.addColorStop(1, '#1d4ed8');
                this.ctx.fillStyle = headGradient;
            } else {
                // Snake body - lighter blue
                this.ctx.fillStyle = `hsl(217, 91%, ${70 - index * 2}%)`;
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // Add shine effect to head
            if (index === 0) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 2,
                    segment.y * this.gridSize + 2,
                    this.gridSize / 2,
                    this.gridSize / 2
                );
            }
        });
        
        // Draw food with pulsing effect
        const time = Date.now() * 0.005;
        const pulse = Math.sin(time) * 0.1 + 0.9;
        const foodSize = this.gridSize * pulse;
        const offset = (this.gridSize - foodSize) / 2;
        
        // Food gradient
        const foodGradient = this.ctx.createRadialGradient(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            0,
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            foodSize / 2
        );
        foodGradient.addColorStop(0, '#ef4444');
        foodGradient.addColorStop(1, '#dc2626');
        
        this.ctx.fillStyle = foodGradient;
        this.ctx.fillRect(
            this.food.x * this.gridSize + offset,
            this.food.y * this.gridSize + offset,
            foodSize,
            foodSize
        );
        
        // Food shine
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.fillRect(
            this.food.x * this.gridSize + offset + 2,
            this.food.y * this.gridSize + offset + 2,
            foodSize / 3,
            foodSize / 3
        );
    }
    
    gameLoop(currentTime = performance.now()) {
        if (!this.gameRunning || this.gamePaused) return;
        
        if (currentTime - this.lastMoveTime >= this.currentSpeed) {
            this.updateGame();
            this.lastMoveTime = currentTime;
        }
        
        this.draw();
        
        if (this.gameRunning) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
}

// Dark mode canvas styling
function updateCanvasForTheme() {
    const canvas = document.getElementById('gameCanvas');
    const isDark = document.documentElement.classList.contains('dark');
    
    if (isDark) {
        canvas.style.backgroundColor = '#1e293b';
    } else {
        canvas.style.backgroundColor = '#ffffff';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    
    // Update canvas styling based on theme
    updateCanvasForTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
        updateCanvasForTheme();
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    });
}); 