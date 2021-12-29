import { AdditiveBlending, BufferGeometry, Color, DynamicDrawUsage, Euler, Float32BufferAttribute, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Points, PointsMaterial, Quaternion, Scene, ShaderLib, ShaderMaterial, TextureLoader, Vector, Vector3 } from "three";

import vueLogo from '../assets/logo.png';

export interface Particle {
  age: number;
  position: Vector3;
  scale: Vector3;
  velocity: Vector3;
}

export class ParticleSystem {
  public lifetime: number = 10;
  public limit: number = 10000;

  public startArea: Vector3 = new Vector3(250, 250, 0);
  public startVelocity: Vector3 = new Vector3(-0.01, 0.01, -0.1);
  public brownianForce: number = 0.01;
  
  private particles: Particle[] = [];

  // private geometry: BufferGeometry = new BufferGeometry();
  // private points?: Points;

  private particle: InstancedMesh;

  public constructor() {
    const geometry = new PlaneGeometry();
    const material = new MeshStandardMaterial({ color: '#fff' });
    this.particle = new InstancedMesh(geometry, material, this.limit);
    this.particle.castShadow = true;
  }

  public setup(scene: Scene) {
    

    scene.add(this.particle);
  }

  public update(dt: number) {
    const aliveParticles: Particle[] = [];
    const creationCount = Math.min(this.limit / ((this.lifetime + 1) / dt), this.limit - this.particles.length);
    
    for (let i = 0; i < creationCount; i++) {
      this.createParticle();
    }
    
    for (let i = 0; i < this.limit; i++) {
      const particle = this.particles[i];
      
      const matrix = new Matrix4();

      if (particle && particle.age > 0) {
        particle.age -= dt;
        particle.velocity
          .add(new Vector3()
            .random()
            .multiplyScalar(this.brownianForce)
            .subScalar(this.brownianForce / 2)
          );
        particle.position.add(particle.velocity);
        
        matrix.compose(
          particle.position,
          new Quaternion().setFromEuler(new Euler(0, 0, 0)),
          particle.scale,
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
    const scale = 0.5 + (Math.random() * 0.5);

    const particle: Particle = {
      age: this.lifetime,
      position: new Vector3().random().multiply(this.startArea).sub(this.startArea.clone().multiplyScalar(0.5)).setZ(100),//new Vector3().random().multiplyScalar(100).setZ(100),
      scale: new Vector3(scale, scale, scale),
      velocity: this.startVelocity.clone(),
    };

    this.particles.push(particle);
  }
}
