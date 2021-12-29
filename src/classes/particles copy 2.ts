import { Box3, BoxGeometry, ColorRepresentation, Euler, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, Points, PointsMaterial, Quaternion, Scene, ShaderLib, ShaderMaterial, SphereGeometry, Texture, TextureLoader, Vector, Vector3, WireframeGeometry } from "three";

export interface Particle {
  age: number;
  size: number;
  position: Vector3;
  velocity: Vector3;
}

export class ParticleSystem {
  public lifetime: number;
  public limit:    number;

  public startArea:       Vector3;
  public startAreaOffset: Vector3;
  public startVelocity:   Vector3;
  public startSize:       number;
  public brownianForce:   number;

  public texture?: Texture;
  public opacity?: number;
  public color?:   ColorRepresentation;

  public shrinkOverTime?: boolean;
  
  private zone: Mesh;

  private particles: Particle[] = [];
  private particle: InstancedMesh;

  public constructor({
    startArea       = new Vector3(200, 200, 200), 
    startAreaOffset = new Vector3(0, 0, 25),
    startVelocity   = new Vector3(0.1, -0.1, -0.1),
    startSize       = 1,
    brownianForce   = 0.01,
    lifetime        = 10,
    limit           = 10000,
    texture         = undefined,
    opacity         = 1,
    color           = '0xffffff',
    shrinkOverTime  = true,
  }: {
    startArea?:       ParticleSystem['startArea'],
    startAreaOffset?: ParticleSystem['startAreaOffset'],
    startVelocity?:   ParticleSystem['startVelocity'],
    startSize?:       ParticleSystem['startSize'],
    brownianForce?:   ParticleSystem['brownianForce'],
    lifetime?:        ParticleSystem['lifetime'],
    limit?:           ParticleSystem['limit'],
    texture?:         ParticleSystem['texture'],
    opacity?:         ParticleSystem['opacity'],
    color?:           ParticleSystem['color'],
    shrinkOverTime?:  ParticleSystem['shrinkOverTime'],
  }) {
    this.startArea       = startArea;
    this.startAreaOffset = startAreaOffset;
    this.startVelocity   = startVelocity;
    this.startSize       = startSize;
    this.brownianForce   = brownianForce;
    this.lifetime        = lifetime;
    this.limit           = limit;
    this.texture         = texture;
    this.opacity         = opacity;
    this.color           = color;
    this.shrinkOverTime  = shrinkOverTime;

    this.particle = new InstancedMesh(
      new PlaneGeometry(),
      new MeshBasicMaterial({
        map: this.texture,
        color: this.color,
        // alphaMap: this.texture,
        transparent: true,
        opacity: this.opacity,
        // alphaTest: 10,
        depthTest: false,
      }),
      this.limit,
    );
    // this.particle.castShadow = true;

    this.zone = new Mesh(
      new BoxGeometry(this.startArea.x, this.startArea.y, this.startArea.z),
      new MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
      }),
    );
    this.zone.visible = true;
    this.zone.position.x = this.startAreaOffset.x;
    this.zone.position.y = this.startAreaOffset.y;
    this.zone.position.z = this.startAreaOffset.z;
  }

  public setup(parent: Object3D, scene: Scene) {
    scene.add(this.particle);
    parent.add(this.zone);
  }

  public update(dt: number) {
    const aliveParticles: Particle[] = [];
    // const creationCount = Math.min(this.limit / ((this.lifetime + 1) / dt), this.limit - this.particles.length);
    const creationCount = this.limit - this.particles.length;
    
    this.zone.geometry.computeBoundingBox();

    for (let i = 0; i < creationCount; i++) {
      this.createParticle();
    }
    
    for (let i = 0; i < this.limit; i++) {
      const particle = this.particles[i];
      
      const matrix = new Matrix4();

      if (particle && (
        particle.age > 0 &&
        this.zone.geometry.boundingBox?.containsPoint(
          this.zone.worldToLocal(particle.position.clone())
        )
      )) {
        particle.age -= dt;
        particle.velocity
          .add(new Vector3()
            .random()
            .multiplyScalar(this.brownianForce)
            .subScalar(this.brownianForce / 2)
          );
        particle.position.add(particle.velocity);

        if (this.shrinkOverTime) {
          particle.size = (particle.age / this.lifetime) * this.startSize;
        }

        matrix.compose(
          particle.position,
          new Quaternion().setFromEuler(new Euler(0, 0, 0)),
          new Vector3().setScalar(particle.size * 0.2),
        );

        aliveParticles.push(particle);
      } else {
        matrix.compose(
          new Vector3(),
          new Quaternion().setFromEuler(new Euler(0, 0, 0)),
          new Vector3(),
        );
      }

      this.particle.updateMatrix();
      this.particle.setMatrixAt(i, matrix);
    }

    this.particle.instanceMatrix.needsUpdate = true;
    this.particles = aliveParticles;
  }

  private createParticle() {
    const size = this.startSize;

    if (this.zone.geometry.boundingBox !== null) {
      const particle: Particle = {
        age: this.lifetime * Math.random(),
        position: this.zone.localToWorld(
          this.createPositionInVolume(
            this.zone.geometry.boundingBox,
          ),
        ),
        velocity: this.startVelocity.clone(),
        size,
      };

      this.particles.push(particle);
    }
  }

  private createPositionInVolume(box: Box3): Vector3 {
    return box.min.clone().add(
      new Vector3().random().multiply(
        box.max.clone().sub(box.min)
      )
    );
  }
}
