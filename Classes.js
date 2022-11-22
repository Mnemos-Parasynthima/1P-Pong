/**
 * The Pong users class
 * @method draw
 */
class User {
  /** 
   * @param {CanvasRenderingContext2D} ctx The canvas context
   */
  constructor(ctx) {
    this.ctx = ctx;
    this.x = null;
    this.y = null;
    this.width = 20;
    this.height = 100;
  }

  /**
   * Draws the user
   * @returns None
   */
  draw() {
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

/**
 * The player class, extends the user class
 * @extends User
 * @method update
 */
class Player extends User {
  /**
   * 
   * @param {CanvasRenderingContext2D} ctx The canvas context
   * @param {Object} keystate The keystate object, holding the left and right movement keys
   */
  constructor(ctx, keystate) {
    super(ctx);
    this.keystate = keystate;
  }

  /**
   * Updates the Player Movement
   * @returns None
   */
  update() {
    if (this.keystate[Up]) this.y -= 7;
    if (this.keystate[Down]) this.y += 7;
    this.y = Math.max(Math.min(this.y, Height - this.height), 0);
  }
}

/**
 * The ai class, extends the user class
 * @extend User
 * @method update
 */
class AI extends User {
  /** 
   * @param {CanvasRenderingContext2D} ctx The canvas context
   */
  constructor(ctx) {
    super(ctx);
  }

  /**
   * Updates the AI movement
   * @returns None
   */
  update(ball) {
    const destY = ball.y - (this.height - ball.side) * 0.5;
    this.y += (destY - this.y) * 0.1; // slowing movement to destination
    this.y = Math.max(Math.min(this.y, Height - this.height), 0);
  }
}

/**
 * The ball class
 * @method serve
 * @method update
 * @method draw
 */
class Ball {
  /**
   * @param {CanvasRenderingContext2D} ctx The canvas context
   */
  constructor(ctx) {
    this.ctx = ctx;
    this.x = null;
    this.y = null;
    this.side = 20;
    this.vel = null;
    this.speed = 12;
  }

  /**
   * Serves the ball from a side
   * @param {Number} side The side to serve from
   * @param {Object} player The player object
   * @param {Object} ai The ai object
   * @returns None
   */
  serve(side, player, ai) {
    const r = Math.random();
    this.x = side === 1 ? player.x + player.width : ai.x - this.side;
    this.y = (Height - this.side) * r;

    const phi = 0.1 * pi * (1 - 2 * r);
    this.vel = {
      x: side * this.speed * Math.cos(phi),
      y: this.speed * Math.sin(phi)
    };
  }

  /**
   * Updates the Ball movement
   * @param {Object} player The player object
   * @param {Object} ai The ai object
   * @returns None
   */
  update(player, ai) {
    this.x += this.vel.x;
    this.y += this.vel.y;

    if (0 > this.y || this.y + this.side > Height) {
      const offset = this.vel.y < 0 ? 0 - this.y : Height - (this.y + this.side);
      this.y += 2 * offset;
      this.vel.y *= -1;
    }

    /**
     * Checks if the axis of the two bounding boxes intersect
     * Two boxes lined with the axis, if they intersect
     * @param {Number} ax The x position of the first box
     * @param {Number} ay The y position of the first box
     * @param {Number} aw The width of the first box
     * @param {Number} ah The height of the first box
     * @param {Number} bx The x position of the second box
     * @param {Number} by The y position of the second box
     * @param {Number} bw The width of the second box
     * @param {Number} bh The height of the second box
     * @returns {Boolean} True or false if the two boxes intersect
     */
    const AABBIntersect = (ax, ay, aw, ah, bx, by, bw, bh) => ax < bx + bw && ay < by + bh && bx < ax + aw && by < ay + ah;

    const pdle = this.vel.x < 0 ? player : ai;
    if (AABBIntersect(pdle.x, pdle.y, pdle.width, pdle.height, this.x, this.y, this.side, this.side)) {
      this.x = pdle === player ? player.x + player.width : ai.x - this.side;
      const n = (this.y + this.side - pdle.y) / (pdle.height + this.side);
      const phi = 0.25 * pi * (2 * n - 1);

      const smash = Math.abs(phi) > 0.2 * pi ? 1.5 : 1;
      this.vel.x = smash * (pdle === player ? 1 : -1) * this.speed * Math.cos(phi);;
      this.vel.y = smash * this.speed * Math.sin(phi);;
    }

    if (0 > this.x + this.side || this.x > Width) {           
      if (this.x > Width) { playerScore++; } 
      else if (0 > this.x + this.side) { aiScore++; }
      console.log(`Player: ${playerScore}; AI: ${aiScore}`);

      this.serve((pdle === player ? 1 : -1), player, ai);
    }
  }

  /**
   * Draws the Ball
   * @returns None
   */
  draw() {
    this.ctx.fillRect(this.x, this.y, this.side, this.side);
  }
}