import gsap from 'gsap'
import { Mesh, Program } from 'ogl'
import Detection from '../../../classes/Detection'
import { getOffset } from '../../../utils/dom'
import { lerp } from '../../../utils/math'
import fragment from '../shaders/media-fragment.glsl'
import vertex from '../shaders/media-vertex.glsl'
import shaderFragment from '../shaders/shader-fragment.glsl'

export default class Media {
  constructor({
    element,
    extraElement,
    geometry,
    gl,
    idx,
    scene,
    viewport,
    sizes,
    url,
    mediaId,
    link,
    caseHeaderMedia,
  }) {
    this.element = element
    this.extraElement = extraElement
    this.geometry = geometry
    this.gl = gl
    this.idx = idx
    this.scene = scene
    this.viewport = viewport
    this.sizes = sizes
    this.url = url
    this.mediaId = mediaId
    this.link = link
    this.caseHeaderMedia = caseHeaderMedia

    this.transition = 0
    this.firstLoad = true
    this.isOpened = false
    this.extra = { x: 0, y: 0 }

    this.createTexture()
    this.createProgram()
    this.createMesh()
    this.createAnim()
  }

  createTexture() {
    this.texture = window.TEXTURES[this.element.getAttribute('data-src')]
    this.image = window.MEDIAS[this.element.getAttribute('data-src')]
  }

  createProgram() {
    this.program = new Program(this.gl, {
      fragment:
        this.element.getAttribute('data-media-id').startsWith('shader') ? shaderFragment : fragment,
      vertex,
      uniforms: {
        uAlpha: { value: 0 },
        uSpeed: { value: 0 },
        uProgress: { value: 0 },
        uTransition: { value: this.transition },
        uTime: { value: 100 * Math.random() },
        uViewportSizes: {
          value: [this.viewport.width, this.viewport.height],
        },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [this.image.naturalWidth, this.image.naturalHeight] },
        tMap: { value: this.texture },
        uMultiplier: { value: 0.1 },
      },
      transparent: true,
    })
  }

  createMesh() {
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    })

    this.mesh.setParent(this.scene)
    this.mesh.position.x = this.idx * this.mesh.scale.x
  }

  async createBounds(viewport, sizes) {
    // const isBugtracker = this.element.getAttribute('alt') === 'bugtracker'
    this.viewport = viewport
    this.sizes = sizes

    this.bounds = getOffset(this.element, this.scrollCurrent)

    if (this.url !== '/')
      this.caseHeaderBounds = getOffset(this.caseHeaderMedia, this.scrollCurrent)
    else
      this.caseHeaderBounds = getOffset(this.caseHeaderMedia)

    this.updateScale()
    this.updateX()
    this.updateY()
  }

  createAnim() {
    this.animation = gsap.timeline({ paused: true })

    this.animation.fromTo(this, {
      transition: 0
    }, {
      delay: 0.5,
      duration: 1.5,
      ease: 'expo.inOut',
      transition: 1
    }, 'start')

    this.animOnInteract = gsap
      .timeline({ paused: true })
      .fromTo(this.program.uniforms.uProgress, {
        value: 0,
      }, {
        delay: 0,
        duration: .1,
        ease: 'power4.in',
        value: 0.1,
      }, 'start')
  }

  animIn() {
    gsap.to(this, {
      delay: 0.5,
      duration: 1.5,
      ease: 'expo.inOut',
      transition: 1,
    })

    gsap.to(this.program.uniforms.uTransition, {
      delay: 0.5,
      duration: 1.5,
      ease: 'expo.inOut',
      value: 1,
    })
  }

  animOut() {
    gsap.to(this, {
      delay: 0.5,
      duration: 1.5,
      ease: 'expo.inOut',
      transition: 0,
    })

    gsap.to(this.program.uniforms.uTransition, {
      delay: 0.5,
      duration: 1.5,
      ease: 'expo.inOut',
      value: 0,
    })
  }

  async show() {
    gsap.to(this.program.uniforms.uAlpha, {
      delay: 0.5,
      duration: 0.5,
      value: 1,
    })

    gsap.to(this.mesh.position, {
      delay: 0.5,
      duration: 1.5,
      z: 0,
    })
  }

  async hide() {
    gsap.to(this.program.uniforms.uAlpha, {
      delay: 0.5,
      duration: 0.5,
      value: 0,
    })

    gsap.to(this.mesh.position, {
      delay: 0.5,
      duration: 1.5,
      z: -3,
    })
  }

  onInteractionEnter() {
    if (Detection.isMobile()) return
    this.animOnInteract.play()
  }

  onInteractionLeave() {
    if (Detection.isMobile()) return
    this.animOnInteract.reverse()
  }

  onOpen() {
    // this.animation.play()
    this.isOpened = true
    this.animIn()

    if (this.firstLoad) {
      this.show()
      this.firstLoad = false
    }
  }

  async onClose() {
    // this.animation.reverse()
    this.isOpened = false
    this.animOut()
  }

  onResize(viewport, sizes, url) {
    this.url = url

    this.createBounds(viewport, sizes)
  }

  updateScale() {
    // const widthPercent = this.bounds.width / this.sizes.width
    // const heightPercent = this.bounds.height / this.sizes.height

    const widthPercent = lerp(
      this.bounds.width / this.sizes.width,
      this.caseHeaderBounds.width / this.sizes.width,
      this.transition,
    )

    const heightPercent = lerp(
      this.bounds.height / this.sizes.height,
      this.caseHeaderBounds.height / this.sizes.height,
      this.transition,
    )

    this.mesh.scale.x = this.viewport.width * widthPercent
    this.mesh.scale.y = this.viewport.height * heightPercent
  }

  updateX(x = 0) {
    x = lerp(this.bounds.left, this.caseHeaderBounds.left, this.transition)

    this.mesh.position.x =
      -(this.viewport.width / 2) + (this.mesh.scale.x / 2) +
      (x / this.sizes.width) * this.viewport.width

    // this.mesh.position.x =
    //   -(this.viewport.width / 2) + (this.mesh.scale.x / 2) +
    //   ((this.bounds.left + x) / this.sizes.width) * this.viewport.width +
    //   this.extra.x
  }

  updateY(y = 0) {
    this.y = lerp(
      this.bounds.top - y,
      this.caseHeaderBounds.top - y,
      this.transition,
    )

    this.mesh.position.y = (this.viewport.height / 2) - (this.mesh.scale.y / 2) -
      (this.y / this.sizes.height) * this.viewport.height
  }

  update(scroll, speed) {
    if (!this.bounds) return

    this.scrollCurrent = scroll.current

    this.updateScale()
    this.updateX()
    this.updateY(scroll.current)

    this.program.uniforms.uSpeed.value = speed
    this.program.uniforms.uTime.value += 0.04
    this.mesh.program.uniforms.uPlaneSizes.value = [this.mesh.scale.x, this.mesh.scale.y]
  }
}