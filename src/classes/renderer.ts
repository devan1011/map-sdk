import { Scene, WebGLRenderer, XRAnimationLoopCallback } from "three";
import { View } from "./view";

import Stats from "../lib/stats";

export class WorldRenderer {
  private renderer?: WebGLRenderer;
  private stats;

  private lastFrameTime: number = 0;
  
  constructor(canvas?: HTMLCanvasElement) {
    if (canvas !== undefined) {
      this.setup(canvas);
    }

    this.stats = new Stats();
    document.body.appendChild( this.stats.dom );

    this.onResize = this.onResize.bind(this);
  }

  public setup(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    this.renderer.shadowMap.enabled = true;

    this.renderer.setPixelRatio( window.devicePixelRatio ); // TODO - Dont use window
    this.renderer.setSize(window.innerWidth,window.innerHeight); // TODO - Dont use window

    window.addEventListener('resize', this.onResize);
  }

  public render(scene: Scene, view: View) {
    this.renderer?.render(scene, view.camera);
    this.stats.update();
  }

  public loop(callback: XRAnimationLoopCallback) {
    this.renderer?.setAnimationLoop((time) => {
      const dt = time - (this.lastFrameTime || time);
      this.lastFrameTime = time;

      callback(dt / 1000);
    });
  }

  public dispose() {
    this.renderer?.dispose();

    window.removeEventListener('resize', this.onResize);
  }

  private onResize() {
    if (this.renderer) {
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.renderer.setSize(window.innerWidth,window.innerHeight); // TODO - Dont use window
    }
  }
}
