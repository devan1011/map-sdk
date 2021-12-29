import { ImageUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, Scene, TextureLoader } from "three";
import { World } from "./world";

export class Map {
  public object: Object3D;
  public image: string;

  constructor({
    image,
  }: {
    image: Map['image'],
  }) {
    this.image = image;
    
    const texture = new TextureLoader().load(this.image);
    const texRatio = 5000 / 2350 // 4096 / 2897;

    this.object = new Mesh(
      new PlaneGeometry(texRatio * 200, 200),
      new MeshStandardMaterial({ map: texture, color: '#aaa' }),
    );
    this.object.receiveShadow = true;


    const background = new Mesh(
      new PlaneGeometry(10000, 10000),
      new MeshStandardMaterial({ color: 0xffffff, alphaTest: 0, visible: true }),
    );
    background.position.z = -1;

    this.object.add(background);
  }
  
  public setup(world: World): void {
    world.scene.add(this.object);
  }
}
