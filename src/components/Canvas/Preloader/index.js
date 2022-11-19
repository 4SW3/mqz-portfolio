import gsap from 'gsap'
import { Mesh, Program, Transform, Triangle } from 'ogl'
import Component from '../../../classes/Component'
import { getOffset } from '../../../utils/dom'
import { split } from '../../../utils/text'
import fragment from '../shaders/preloader-fragment.glsl'
import vertex from '../shaders/vertex.glsl'

export default class WebGLPreloader extends Component {
  constructor({ gl, scene, viewport, sizes, url, colors }) {
    super({
      classes: {},
      element: '.preloader',
      elements: {
        content: document.querySelector('.content'),
        nav: document.querySelector('.nav'),
        progress: '.progress',
        progressIn: '.progress_inside',
        text: '.preloader_text',
      },
    })

    this.gl = gl
    this.scene = scene
    this.viewport = viewport
    this.sizes = sizes
    this.url = url
    this.colors = colors

    this.group = new Transform()

    this.titleSpans = split({
      element: this.elements.text,
      expression: `<br>`,
    })

    this.createGeometry()
    this.createProgram()
    this.createMesh()

    this.group.setParent(this.scene)

    this.show()
  }

  createBounds(viewport, sizes) {
    this.viewport = viewport
    this.sizes = sizes

    this.bounds = getOffset(this.elements.content)
  }

  createGeometry() {
    this.geometry = new Triangle(this.gl)
  }

  createProgram() {
    this.program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        uAlpha: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uResolution: { value: [this.sizes.width, this.sizes.height] },
        uColor: { value: this.colors.light }
      },
      transparent: true,
      cullFace: null,
    })
  }

  createMesh() {
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    })

    this.mesh.setParent(this.scene)
    this.mesh.scale.set(20)
    this.mesh.position.z = 5
  }

  async show() {
    gsap.to(this.program.uniforms.uAlpha, {
      duration: 0.5,
      value: 1,
    })
  }

  async hide() {
    this.anim = gsap.timeline({
      delay: 0.5,
    })

    this.anim.to(
      [...this.titleSpans,
      this.elements.progress,
      this.elements.progressIn,
      ],
      {
        autoAlpha: 0,
        duration: 1.5,
        ease: 'expo.out',
        stagger: -0.1,
        y: '100%',
      })

    this.anim.to(this.element, {
      autoAlpha: 0,
    })

    this.anim.to(this.program.uniforms.uAlpha, {
      value: 0,
    })

    this.anim.to(this.elements.content, {
      opacity: 1,
      visibility: 'visible',
    })

    this.anim.to(this.elements.nav, {
      opacity: 1,
      visibility: 'visible',
    })
  }

  onChange(url) {
    this.url = url
  }

  onResize({ viewport }) {
    this.viewport = viewport

  }

  onTouchDown() { }

  onTouchMove() { }

  onTouchUp() { }

  onWheel() { }

  update() {
    if (!this.bounds) return

    // this.y.current = lerp(this.y.current, this.y.target, this.y.ease)
  }
}
