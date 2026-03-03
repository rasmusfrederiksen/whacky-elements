
export class FreelyDraggable extends HTMLElement {
  constructor() {
    super();

    this._x = 0;
    this._y = 0;
    this._dragging = false;
    this._pointerId = null;

    this._startPX = 0;
    this._startPY = 0;
    this._startX = 0;
    this._startY = 0;

    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { display: inline-block; }
        .wrap {
          position: relative;
          display: inline-block;
          transform: translate(var(--x, 0px), var(--y, 0px));
          will-change: transform;
        }
        /* The bigger invisible hit area / handle */
        .handle {
          position: absolute;
          inset: -24px;              /* increase hit box */
          touch-action: none;        /* critical on mobile */
          user-select: none;
          cursor: grab;
        }
        .wrap.dragging .handle { cursor: grabbing; }

        /* Ensure slotted image behaves */
        ::slotted(img) {
          display: block;
          max-width: 100%;
          height: auto;
          pointer-events: none;      /* handle receives the pointer events */
          user-select: none;
          -webkit-user-drag: none;
        }
      </style>

      <div class="wrap">
        <slot></slot>
        <div class="handle" part="handle" aria-hidden="true"></div>
      </div>
    `;

    this._wrap = root.querySelector('.wrap');
    this._handle = root.querySelector('.handle');

    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
  }

  connectedCallback() {
    this._handle.addEventListener('pointerdown', this._onDown);
    window.addEventListener('pointermove', this._onMove);
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);

    // optional: allow initial position via attributes
    if (this.hasAttribute('x')) this._x = Number(this.getAttribute('x')) || 0;
    if (this.hasAttribute('y')) this._y = Number(this.getAttribute('y')) || 0;
    this._apply();
  }

  disconnectedCallback() {
    this._handle.removeEventListener('pointerdown', this._onDown);
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onUp);
  }

  _apply() {
    this.style.setProperty('--x', `${this._x}px`);
    this.style.setProperty('--y', `${this._y}px`);
  }

  _onDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    this._dragging = true;
    this._pointerId = e.pointerId;

    this._startPX = e.clientX;
    this._startPY = e.clientY;
    this._startX = this._x;
    this._startY = this._y;

    this._wrap.classList.add('dragging');
    this._handle.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }

  _onMove(e) {
    if (!this._dragging) return;
    if (this._pointerId !== null && e.pointerId !== this._pointerId) return;

    this._x = this._startX + (e.clientX - this._startPX);
    this._y = this._startY + (e.clientY - this._startPY);
    this._apply();
  }

  _onUp(e) {
    if (!this._dragging) return;
    if (this._pointerId !== null && e.pointerId !== this._pointerId) return;

    this._dragging = false;
    this._pointerId = null;
    this._wrap.classList.remove('dragging');
  }
}

customElements.define('freely-draggable', FreelyDraggable);

export default FreelyDraggable;
