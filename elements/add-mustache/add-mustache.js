
import '../freely-draggable/freely-draggable.js';

export class AddMustache extends HTMLElement {
  constructor() {
    super();

    this._rotation = 0;
    this._scale = 1;
    this._isopen = false;

    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          display: inline-block;
          --mustache-size: 6rem;
        }

        /* just pass through whatever the user gives us */
        ::slotted(img) {
          display: block;
          max-width: 100%;
          height: auto;
        }

        /* ---- overlay ---- */
        .overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(185,185,185,.72);
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }
        .overlay.open { display: flex; }

        /* the canvas where the image + mustache live */
        .canvas {
          position: relative;
          max-width: 90vw;
          max-height: 80vh;
        }
        .canvas img {
          display: block;
          max-width: 90vw;
          max-height: 80vh;
          object-fit: contain;
          border-radius: 6px;
          user-select: none;
          -webkit-user-drag: none;
        }

        .spacer {
          width: var(--mustache-size);
        }

        .mustache {
          width: var(--mustache-size);
        }

        /* mustache inside the canvas */

        freely-draggable {
          position: absolute;
          z-index: 1;
        }
        freely-draggable img {
          display: block;
          width: var(--mustache-size);
          transform: rotate(var(--mustache-rotation, 0deg));
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
        }

        /* ---- toolbar ---- */
        .toolbar {
          display: flex;
          position: relative;
          bottom: -2rem;
          gap: .5rem;
          align-items: center;
          padding: 1.5rem 2rem;
          background-color: white;
          border-radius: 999px;
        }
        .toolbar button {
          background: #fff;
          border: none;
          width: 2.6rem;
          height: 2.6rem;
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .15s;
        }
        .toolbar button:hover { background: #e8e8e8; }
        .toolbar button:active { background: #d0d0d0; }

        .toolbar .sep {
          width: 1px;
          height: 1.8rem;
          background: rgba(255,255,255,.3);
          margin: 0 .25rem;
        }

        /* close button */
        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1.2rem;
          background: rgba(0,0,0,.35);
          border: none;
          color: #fff;
          font-size: 2rem;
          width: 2.8rem;
          height: 2.8rem;
          border-radius: 999px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          transition: background .15s;
        }
        .close-btn:hover { background: rgba(0,0,0,.65); }
      </style>

      <!-- thumbnail the user sees normally -->
      <slot></slot>

      <!-- fullscreen overlay -->
      <div class="overlay" part="overlay">
        <button class="close-btn" aria-label="Close">&times;</button>
        <div class="canvas">
          <img class="full-image" />
        </div>
        <div class="toolbar">
          <freely-draggable>
            <svg class="mustache" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 158.3">
              <path d="M451.6,151c-37.7,12.2-82.5,8.1-119.4-5.4-32.7-12-54.8-32.4-77.1-58.9-29.9,39.2-72.2,65.3-121.5,70.4-38.4,4-85.2-2.4-113.6-30.7S-4.3,83.8,2.7,60.1C13.4,24.2,52.1,21.2,53,31.9s-11.1-.6-20.3,9.6-9.6,19.2-5.8,30c3.1,8.9,11.1,16.4,21.3,19.1s21.5,1.6,31.9-2.5c35.1-13.7,54-52.4,85.5-74.4S197.6-1.3,215.5.5c11.4,1.1,22,4.9,30.7,12.1l8.9,7.3c10.6-9.2,22.2-16.7,36.1-18.9,20.6-3.2,40.9,2.3,57.4,14.8,7.3,5.5,13.8,11.4,20,18.2l21.6,23.7c12,13.1,26.7,25.5,43.7,31.5,14.2,5,31.7,4.8,43.1-5.9s12.8-28.3,2.8-40.4c-8.2-10-18-7.1-20.6-9.1s-.6-1.6-.4-2.1c.9-2.3,3.2-3.8,5.7-4.3,12.2-2.4,24.4,1.6,33.2,10.5s10.6,14.7,12.6,24c4,18.7.6,38.6-9.7,54.8s-9.8,12.1-16,17c-9.9,8-21,13.5-33.1,17.4Z"/>
            </svg>
          </freely-draggable>
          <div class="spacer"></div>
          <button class="btn-smaller" aria-label="Smaller" title="Smaller">&#8722;</button>
          <button class="btn-bigger"  aria-label="Bigger"  title="Bigger">&#43;</button>
          <button class="btn-rotate-left"  aria-label="Rotate left"  title="Rotate left">&#8634;</button>
          <button class="btn-rotate-right" aria-label="Rotate right" title="Rotate right">&#8635;</button>
        </div>
      </div>
    `;

    // cache refs
    this._overlay   = root.querySelector('.overlay');
    this._closeBtn  = root.querySelector('.close-btn');
    this._fullImage = root.querySelector('.full-image');
    this._draggable = root.querySelector('freely-draggable');
    this._mustacheSvg = root.querySelector('.mustache');

    this._btnRotL  = root.querySelector('.btn-rotate-left');
    this._btnRotR  = root.querySelector('.btn-rotate-right');
    this._btnSmall = root.querySelector('.btn-smaller');
    this._btnBig   = root.querySelector('.btn-bigger');

    this._flipped = false;

    // bindings
    this._open  = this._open.bind(this);
    this._close = this._close.bind(this);
    this._onKey = this._onKey.bind(this);
  }

  /* ---- lifecycle ---- */

  connectedCallback() {

    this.addEventListener('dblclick', this._open);
    this._closeBtn.addEventListener('click', this._close);
    this._overlay.addEventListener('click', (e) => {
      if (e.target === this._overlay) this._close();
    });

    // toolbar
    this._btnRotL.addEventListener('click',  () => this._rotate(-2));
    this._btnRotR.addEventListener('click',  () => this._rotate(2));
    this._btnSmall.addEventListener('click', () => this._resize(-0.075));
    this._btnBig.addEventListener('click',   () => this._resize(0.075));
  }

  disconnectedCallback() {
    this.removeEventListener('dblclick', this._open);
    document.removeEventListener('keydown', this._onKey);
  }

  /* ---- overlay open / close ---- */

  _open() {
    if (this._isopen) return;
    this._isopen = true;
    // grab the <img> from the slot
    const slotImg = this.querySelector('img');
    if (!slotImg) return;
    this._fullImage.src = slotImg.currentSrc || slotImg.src;

    // reset mustache transforms
    this._rotation = 0;
    this._scale = 1;
    this._flipped = false;
    this._applyMustache();

    // reset drag position
    this._draggable.setAttribute('x', '0');
    this._draggable.setAttribute('y', '0');
    if (this._draggable._x !== undefined) {
      this._draggable._x = 0;
      this._draggable._y = 0;
      this._draggable._apply?.();
    }

    this._overlay.classList.add('open');
    document.addEventListener('keydown', this._onKey);
  }

  _close() {
    this._overlay.classList.remove('open');
    document.removeEventListener('keydown', this._onKey);
    this._isopen = false;
  }

  _onKey(e) {
    if (e.key === 'Escape') this._close();
  }

  /* ---- mustache transforms ---- */

  _applyMustache() {
    this._mustacheSvg.style.transform =
      `scale(${this._scale}) rotate(${this._rotation}deg)`;
  }

  _rotate(deg) {
    this._rotation += deg;
    this._applyMustache();
  }

  _resize(step) {
    this._scale += step;
    this._applyMustache();
  }

}

customElements.define('add-mustache', AddMustache);

export default AddMustache;
