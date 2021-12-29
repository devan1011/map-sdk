import { Object3D, PerspectiveCamera, Camera as ThreeCamera, Mesh, MeshBasicMaterial, SphereGeometry, Raycaster, Vector2, PlaneGeometry, Vector3, PointLight, HemisphereLight } from "three";
import { degToRad } from "three/src/math/MathUtils";
import { World } from "./world";

export class View {
  public origin: Object3D;
  public camera: ThreeCamera;

  public zoom: number = 100;

  private cursorRaycaster: Raycaster;
  private cursor:          Object3D;
  private cursorHitPlane:  Object3D;

  private screenMousePosition: Vector2 = new Vector2();
  private mousePosition:       Vector3 = new Vector3();
  private mouseGrabbing:       boolean = false;

  private panVelocity:  Vector3 = new Vector3();
  private zoomVelocity: number = 0;

  public constructor() {
    this.origin = new Object3D();

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera(70, aspect, 1, 1000);
    this.camera.position.z = this.zoom;

    const cameraOrigin = new Object3D();
    cameraOrigin.rotateX(degToRad(20));
    cameraOrigin.add(this.camera);
    this.origin.add(cameraOrigin);

    const sunLight = new PointLight(0xc9e2ff, 3, 400, 1);
    sunLight.position.z = 200;
    sunLight.castShadow = true;
    this.origin.add(sunLight);


    this.cursor = new Object3D();
    // const cursorLight = new PointLight(0xffffff, 0.5, 400, 1);
    // cursorLight.position.z = 5;
    // this.cursor.add(cursorLight);
    
    this.cursorHitPlane = new Mesh(
      new PlaneGeometry(1000, 1000),
      new MeshBasicMaterial({ color: 0x248f24, alphaTest: 0, visible: false }),
    );
    this.origin.add(this.cursorHitPlane);

    this.cursorRaycaster = new Raycaster();

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp   = this.onMouseUp.bind(this);
    this.onZoom      = this.onZoom.bind(this);
    this.onResize    = this.onResize.bind(this);
  }

  public setup(world: World): void {
    world.scene.add(this.origin);
    world.scene.add(this.cursor);

    window.addEventListener('mousedown',  this.onMouseDown);
    window.addEventListener('mousemove',  this.onMouseMove);
    window.addEventListener('mouseup',    this.onMouseUp);
    window.addEventListener('mousewheel', this.onZoom);
    window.addEventListener('resize',     this.onResize);
  }

  public update(world: World, dt: number): void {
    if (this.mouseGrabbing) {
      const position = this.computeMousePosition();
      const delta = this.mousePosition.clone().sub(position);

      this.panVelocity = delta.clone().multiplyScalar(50);      
      this.mousePosition = position.add(delta);
      this.origin.position.add(delta);
    } else {
      this.origin.position.add(this.panVelocity.clone().multiplyScalar(dt));
      this.panVelocity.multiplyScalar(0.85);
    }

    if (this.zoomVelocity !== 0) {
      this.zoom = Math.max(11, this.zoom + (this.zoomVelocity * dt));
      this.camera.position.z = this.zoom;
      this.zoomVelocity *= 0.9;
    }
  }

  public dispose(world: World): void {
    window.removeEventListener('mousedown',  this.onMouseDown);
    window.removeEventListener('mousemove',  this.onMouseMove);
    window.removeEventListener('mouseup',    this.onMouseUp);
    window.removeEventListener('mousewheel', this.onZoom);
    window.removeEventListener('resize',     this.onResize);
  }

  private onMouseDown(event: MouseEvent) {
    this.mouseGrabbing = true;

    this.mousePosition = this.computeMousePosition();
  }

  private computeMousePosition(): Vector3 {
    this.cursorRaycaster.setFromCamera(this.screenMousePosition, this.camera);
    const intersection = this.cursorRaycaster.intersectObject(this.cursorHitPlane)[0];

    if (intersection === undefined) {
      return new Vector3();
    }

    return intersection.point;
  }

  private updateCursor() {
    const position = this.computeMousePosition();
    this.cursor.position.x = position.x;
    this.cursor.position.y = position.y;
    this.cursor.position.z = position.z;
  }

  private onMouseMove(event: MouseEvent) {
    this.screenMousePosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.screenMousePosition.y = -( event.clientY / window.innerHeight ) * 2 + 1;
  
    this.updateCursor();
  }

  private onMouseUp(event: MouseEvent) {
    this.mouseGrabbing = false;
  }

  private onZoom(event: WheelEvent) {
    this.zoomVelocity = event.deltaY * Math.sqrt(this.zoom - 0) * 0.2;

    this.updateCursor();
  }

  private onResize() {
    if (this.camera instanceof PerspectiveCamera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
  }
}
