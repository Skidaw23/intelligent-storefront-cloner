// =============================================================================
// 3D WATCH VIEWER - Advanced WebGL Integration for Rolex Watches
// =============================================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';

interface Watch3DConfig {
  container: HTMLElement;
  modelUrl: string;
  environmentUrl?: string;
  autoRotate?: boolean;
  enableControls?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  animations?: string[];
  materialVariants?: Record<string, any>;
}

interface Watch3DCallbacks {
  onLoad?: (model: THREE.Group) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onInteraction?: (event: string) => void;
}

export class Watch3DViewer {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private controls: OrbitControls;
  private clock: THREE.Clock;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  
  private watchModel: THREE.Group | null = null;
  private animations: THREE.AnimationMixer | null = null;
  private environmentMap: THREE.Texture | null = null;
  
  private config: Watch3DConfig;
  private callbacks: Watch3DCallbacks;
  private isInitialized = false;
  private isLoading = false;
  private animationId: number | null = null;
  
  // Performance monitoring
  private performanceMonitor = {
    fps: 0,
    frameCount: 0,
    lastTime: performance.now()
  };

  constructor(config: Watch3DConfig, callbacks: Watch3DCallbacks = {}) {
    this.config = {
      autoRotate: true,
      enableControls: true,
      quality: 'high',
      animations: [],
      materialVariants: {},
      ...config
    };
    
    this.callbacks = callbacks;
    this.container = config.container;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.init();
  }

  private async init(): Promise<void> {
    try {
      this.setupScene();
      this.setupCamera();
      this.setupRenderer();
      this.setupLights();
      this.setupControls();
      this.setupPostProcessing();
      this.setupEventListeners();
      
      if (this.config.environmentUrl) {
        await this.loadEnvironment();
      }
      
      await this.loadModel();
      
      this.startRenderLoop();
      this.isInitialized = true;
      
    } catch (error) {
      console.error('Failed to initialize 3D viewer:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  private setupScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf8f8f6); // Rolex pearl white
    
    // Fog for depth
    this.scene.fog = new THREE.Fog(0xf8f8f6, 10, 50);
  }

  private setupCamera(): void {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 5);
  }

  private setupRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.config.quality !== 'low',
      alpha: true,
      powerPreference: this.config.quality === 'ultra' ? 'high-performance' : 'default'
    });
    
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.getMaxPixelRatio()));
    
    // Enable advanced rendering features
    this.renderer.shadowMap.enabled = this.config.quality !== 'low';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    
    // Physical material support
    this.renderer.physicallyCorrectLights = true;
    
    this.container.appendChild(this.renderer.domElement);
  }

  private getMaxPixelRatio(): number {
    switch (this.config.quality) {
      case 'low': return 1;
      case 'medium': return 1.5;
      case 'high': return 2;
      case 'ultra': return 3;
      default: return 2;
    }
  }

  private setupLights(): void {
    // Key light (main illumination)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 500;
    this.scene.add(keyLight);

    // Fill light (softer shadows)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 2, 3);
    this.scene.add(fillLight);

    // Rim light (edge definition)
    const rimLight = new THREE.DirectionalLight(0xa37e2c, 0.6); // Rolex gold
    rimLight.position.set(0, -5, -5);
    this.scene.add(rimLight);

    // Ambient light (overall illumination)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    // Environment light for reflections
    if (this.config.quality !== 'low') {
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
      hemiLight.position.set(0, 20, 0);
      this.scene.add(hemiLight);
    }
  }

  private setupControls(): void {
    if (!this.config.enableControls) return;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = this.config.autoRotate;
    this.controls.autoRotateSpeed = 0.5;
    this.controls.enablePan = false;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
    this.controls.maxPolarAngle = Math.PI * 0.75;
  }

  private setupPostProcessing(): void {
    if (this.config.quality === 'low') return;

    this.composer = new EffectComposer(this.renderer);
    
    // Base render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // SSAO for better depth perception
    if (this.config.quality === 'ultra') {
      const ssaoPass = new SSAOPass(this.scene, this.camera, 
        this.container.clientWidth, this.container.clientHeight);
      ssaoPass.kernelRadius = 16;
      ssaoPass.minDistance = 0.005;
      ssaoPass.maxDistance = 0.1;
      this.composer.addPass(ssaoPass);
    }

    // Subtle bloom for metallic surfaces
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
      0.15, // strength
      0.4,  // radius
      0.85  // threshold
    );
    this.composer.addPass(bloomPass);
  }

  private async loadEnvironment(): Promise<void> {
    const loader = new RGBELoader();
    
    try {
      const texture = await loader.loadAsync(this.config.environmentUrl!);
      texture.mapping = THREE.EquirectangularReflectionMapping;
      
      this.scene.environment = texture;
      this.environmentMap = texture;
      
    } catch (error) {
      console.warn('Failed to load environment map:', error);
    }
  }

  private async loadModel(): Promise<void> {
    this.isLoading = true;
    const loader = new GLTFLoader();

    try {
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.load(
          this.config.modelUrl,
          resolve,
          (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            this.callbacks.onProgress?.(percent);
          },
          reject
        );
      });

      this.watchModel = gltf.scene;
      this.processModel(this.watchModel);
      
      // Setup animations
      if (gltf.animations && gltf.animations.length > 0) {
        this.animations = new THREE.AnimationMixer(this.watchModel);
        
        gltf.animations.forEach((clip, index) => {
          if (this.config.animations?.includes(clip.name) || this.config.animations?.length === 0) {
            const action = this.animations!.clipAction(clip);
            action.play();
          }
        });
      }

      this.scene.add(this.watchModel);
      this.centerModel();
      
      this.callbacks.onLoad?.(this.watchModel);
      
    } catch (error) {
      console.error('Failed to load 3D model:', error);
      this.callbacks.onError?.(error as Error);
    } finally {
      this.isLoading = false;
    }
  }

  private processModel(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Enhance materials for luxury appearance
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.envMapIntensity = 1;
          child.material.metalness = 0.9;
          child.material.roughness = 0.1;
          
          // Apply material variants if available
          const materialName = child.material.name;
          if (this.config.materialVariants?.[materialName]) {
            Object.assign(child.material, this.config.materialVariants[materialName]);
          }
        }
      }
    });
  }

  private centerModel(): void {
    if (!this.watchModel) return;

    const box = new THREE.Box3().setFromObject(this.watchModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Center the model
    this.watchModel.position.x = -center.x;
    this.watchModel.position.y = -center.y;
    this.watchModel.position.z = -center.z;
    
    // Scale to fit viewport
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    this.watchModel.scale.setScalar(scale);
  }

  private setupEventListeners(): void {
    // Resize handler
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Mouse interaction
    this.renderer.domElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.renderer.domElement.addEventListener('click', this.handleClick.bind(this));
    
    // Performance monitoring
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        this.startPerformanceMonitoring();
      });
    }
  }

  private handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private handleClick(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    if (this.watchModel) {
      const intersects = this.raycaster.intersectObject(this.watchModel, true);
      
      if (intersects.length > 0) {
        this.callbacks.onInteraction?.('model_click');
        
        // Add click animation
        this.addClickEffect(intersects[0].point);
      }
    }
  }

  private addClickEffect(position: THREE.Vector3): void {
    // Create ripple effect at click position
    const ripple = new THREE.Mesh(
      new THREE.RingGeometry(0, 0.1, 16),
      new THREE.MeshBasicMaterial({ 
        color: 0xa37e2c, 
        transparent: true, 
        opacity: 0.6 
      })
    );
    
    ripple.position.copy(position);
    ripple.lookAt(this.camera.position);
    this.scene.add(ripple);
    
    // Animate ripple
    const startTime = this.clock.getElapsedTime();
    const animate = () => {
      const elapsed = this.clock.getElapsedTime() - startTime;
      const progress = elapsed / 0.5; // 500ms animation
      
      if (progress < 1) {
        ripple.scale.setScalar(progress * 5);
        ripple.material.opacity = 0.6 * (1 - progress);
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(ripple);
      }
    };
    animate();
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      const now = performance.now();
      const delta = now - this.performanceMonitor.lastTime;
      
      if (delta >= 1000) {
        this.performanceMonitor.fps = (this.performanceMonitor.frameCount * 1000) / delta;
        this.performanceMonitor.frameCount = 0;
        this.performanceMonitor.lastTime = now;
        
        // Adjust quality if FPS is too low
        if (this.performanceMonitor.fps < 30 && this.config.quality !== 'low') {
          this.adjustQuality();
        }
      }
      
      this.performanceMonitor.frameCount++;
    }, 100);
  }

  private adjustQuality(): void {
    console.warn('🎮 Adjusting 3D quality due to low FPS');
    
    // Reduce pixel ratio
    this.renderer.setPixelRatio(1);
    
    // Disable post-processing
    if (this.composer) {
      this.composer = null as any;
    }
    
    // Reduce shadow quality
    this.scene.traverse((child) => {
      if (child instanceof THREE.Light && child.shadow) {
        child.shadow.mapSize.width = 1024;
        child.shadow.mapSize.height = 1024;
      }
    });
  }

  private startRenderLoop(): void {
    const render = () => {
      this.animationId = requestAnimationFrame(render);
      
      const delta = this.clock.getDelta();
      
      // Update controls
      if (this.controls) {
        this.controls.update();
      }
      
      // Update animations
      if (this.animations) {
        this.animations.update(delta);
      }
      
      // Render scene
      if (this.composer) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    };
    
    render();
  }

  // Public API methods
  public updateMaterial(materialName: string, properties: any): void {
    if (!this.watchModel) return;
    
    this.watchModel.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material.name === materialName) {
        Object.assign(child.material, properties);
      }
    });
  }

  public playAnimation(animationName: string): void {
    if (!this.animations) return;
    
    const action = this.animations.existingAction(animationName);
    if (action) {
      action.play();
    }
  }

  public setAutoRotate(enabled: boolean): void {
    if (this.controls) {
      this.controls.autoRotate = enabled;
    }
  }

  public takeScreenshot(): string {
    return this.renderer.domElement.toDataURL('image/png');
  }

  public dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }
    
    // Clean up scene
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    
    window.removeEventListener('resize', this.handleResize.bind(this));
  }
}

// Factory function for easier instantiation
export function createWatch3DViewer(
  container: HTMLElement, 
  modelUrl: string, 
  options: Partial<Watch3DConfig> = {},
  callbacks: Watch3DCallbacks = {}
): Watch3DViewer {
  return new Watch3DViewer({ container, modelUrl, ...options }, callbacks);
}

// Global registration for Shopify sections
if (typeof window !== 'undefined') {
  (window as any).RolexWatch3DViewer = Watch3DViewer;
  (window as any).createWatch3DViewer = createWatch3DViewer;
}