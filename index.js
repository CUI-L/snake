let snake;
window.onload = () => {
  if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
    document.getElementById("btns").style.display = "block";
  }
  snake = new Snake("snake", "score", "speed", 36, 36);
  bindEvent();
};

function bindEvent() {
  document.getElementById("begin").onclick = (e) => {
    const elem = e.target;
    snake.init();
    elem.disabled = true;
    elem.style.opacity = 0.5;
    document.getElementById("up").addEventListener("touchstart", () => {
      if(snake.nextDirection == 2) return;
      snake.nextDirection = 4;
    });
    document.getElementById("down").addEventListener("touchstart", () => {
      if(snake.nextDirection == 4) return;
      snake.nextDirection = 2;
    });
    document.getElementById("left").addEventListener("touchstart", () => {
      if(snake.nextDirection == 1) return;
      snake.nextDirection = 3;
    });
    document.getElementById("right").addEventListener("touchstart", () => {
      if(snake.nextDirection == 3) return;
      snake.nextDirection = 1;
    });
  };
}
function Snake(ele, scoreele, speedele, x, y) {
  this.cellWidth = 15; //格子的大小
  this.ele = document.getElementById(ele);
  this.cxt = this.ele.getContext("2d");
  this.x = x;
  this.y = y;
  this.scoreele = document.getElementById(scoreele);
  this.speedele = document.getElementById(speedele);
  this.timer = null;
  this.nextDirection = 1;
  //生成canvas大小、边框。
  this.ele.width = this.cellWidth * this.x;
  this.ele.height = this.cellWidth * this.y;
  this.changeDiretion = function () {
    //更换移动下一步的方向。
    let that = this;
    document.onkeydown = function (event) {
      let e = event || window.event || arguments.callee.caller.arguments[0];
      let direction = that.direction;
      let keyCode = e.keyCode;

      switch (keyCode) {
        case 39: //右
          if (direction != 1 && direction != 3) {
            that.nextDirection = 1;
          }
          break;
        case 40: //下
          if (direction != 2 && direction != 4) {
            that.nextDirection = 2;
          }
          break;
        case 37: //左
          if (direction != 1 && direction != 3) {
            that.nextDirection = 3;
          }
          break;
        case 38: //上
          if (direction != 2 && direction != 4) {
            that.nextDirection = 4;
          }
          break;

        default:
          break;
      }
    };
  };
  this.changeDiretion(); //绑定方向事件
  this.init = function () {
    //初始化、重置、恢复数据
    this.direction = 1; //向右  2下 3左  4 上
    this.nextDirection = 1;
    this.snakeArr = [
      [0, parseInt(this.y / 2)],
      [1, parseInt(this.y / 2)],
    ];
    this.speed = 1;
    this.score = 0;
    this.cxt.fillStyle = "#fff";
    this.cxt.fillRect(0, 0, this.cellWidth * this.x, this.cellWidth * this.y);
    this.scoreele.innerHTML = "我的得分:0";
    this.speedele.innerHTML = "当前速度:1";
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.createCoolPoint();
    this.drawCell(this.coolPoint, 2);
    this.drawSnake();
    this.setTimer();
  };
  this.getCellArea = function (pos) {
    //返回一个格子左上角的像素坐标[32,666];
    return [
      (pos[0] - 1) * this.cellWidth + 1,
      (pos[1] - 1) * this.cellWidth + 1,
    ];
  };
  this.setTimer = function () {
    let speedArr = [180, 160, 140, 120, 100, 80, 60, 40, 20];
    let speed = this.speed;
    if (speed > 8) {
      speed = 8;
    }
    (function (theThis) {
      let that = theThis;
      that.timer = setTimeout(function () {
        that.moveSnake();
      }, speedArr[speed]);
    })(this);
  };
  this.moveSnake = function () {
    //移动蛇的逻辑，数组处理。
    this.direction =
      this.nextDirection == "" ? this.direction : this.nextDirection; //当前移动方向，和下一个移动方向.
    let direction = this.direction;
    let snakeArr = this.snakeArr;
    let snakeHead = snakeArr[snakeArr.length - 1];
    switch (direction) {
      case 1: //向右
        snakeHead = [snakeHead[0] + 1, snakeHead[1]];
        break;
      case 2: //向下
        snakeHead = [snakeHead[0], snakeHead[1] + 1];
        break;
      case 3: //向左
        snakeHead = [snakeHead[0] - 1, snakeHead[1]];
        break;
      case 4: //向上
        snakeHead = [snakeHead[0], snakeHead[1] - 1];
        break;
    }
    //超界或撞上自己结束、重置
    if (
      in_array(snakeHead, snakeArr) ||
      snakeHead[0] < 0 ||
      snakeHead[0] > this.x ||
      snakeHead[1] < 0 ||
      snakeHead[1] > this.y
    ) {
      window.clearInterval(this.timer);
      alert("游戏结束！本局得分：" + this.score);
      const elem = document.getElementById("begin");
      elem.disabled = false;
      elem.style.opacity = 1;
      return;
    }
    snakeArr.push(snakeHead); //将蛇头放入数组
    this.drawCell(snakeHead, 1);
    if (snakeHead.toString() != this.coolPoint.toString()) {
      let tail = snakeArr.shift(); //移除蛇尾
      this.drawCell(tail, 0);
    } else {
      //撞到coolPoint
      this.createCoolPoint();
      this.drawCell(this.coolPoint, 2);
      this.score = this.score + 10;
      this.scoreele.innerHTML = "我的得分：" + this.score;
      this.speed = Math.ceil((this.score + 1) / 100);
      this.speedele.innerHTML = "当前速度：" + this.speed;
    }
    this.setTimer();
  };
  this.createCoolPoint = function () {
    //随机生成coolPoint，不在代表snakeArr的数组中。
    do {
      this.coolPoint = [getRandom(this.x), getRandom(this.y)];
    } while (in_array(this.coolPoint, this.snakeArr));
  };
  this.drawSnake = function () {
    //绘制初始小蛇。
    let snakeArr = this.snakeArr;
    for (let i = 0, sLen = snakeArr.length; i < sLen; i++) {
      this.drawCell(snakeArr[i], 1);
    }
  };
  this.drawCell = function (pos, type) {
    //绘制会用到的几种颜色的图。
    let colorArr = ["#fff", "rgb(0, 0, 0)", "red"];
    let cxt = this.cxt;
    let area;
    cxt.fillStyle = colorArr[type];
    area = this.getCellArea(pos);
    cxt.fillRect(area[0], area[1], this.cellWidth - 1, this.cellWidth - 1);
  };
}
function moveClock() {
  moveSnake(head.d);
}
let isMove = false;
function beginGame() {
  !isMove && setInterval(moveClock, 300);
  isMove = true;
}
//生成随机1到n之间正整数。
function getRandom(n) {
  return Math.floor(Math.random() * n + 1);
}
//判断一个数组是否在另一个数组中
function in_array(stringToSearch, arrayToSearch) {
  for (s = 0; s < arrayToSearch.length; s++) {
    thisEntry = arrayToSearch[s].toString();
    if (thisEntry == stringToSearch.toString()) {
      return true;
    }
  }
  return false;
}
