import { Geometry, Text, Texture } from 'ogl'
import Component from "../classes/Component"
import Detection from '../classes/Detection'
import { delay } from '../utils/math'

export default class Preloader extends Component {
  constructor({ canvas }) {
    super({
      classes: {},
      element: '.preloader',
      elements: {
        // text: '.preloader_text',
        // number: '.preloader_number',
        // progress: '.progress',
        progressIn: '.progress_inside',
        medias: document.querySelectorAll('.webgl_media_placeholder'),
        intro: document.querySelector('.intro_content'),
      },
    })

    this.canvas = canvas
    window.TEXTURES = {}
    window.MEDIAS = {}
    window.FONTS = {}
    this.length = 0
    this.assetsLength = this.elements.medias.length + 3

    // this.elements.titleSpans = split({
    //   element: this.elements.text,
    //   expression: `<br>`,
    // })

    this.initLoader()
  }

  initLoader() {
    const isWebPSupported = Detection.isWebPSupported()

    {
      const texture = new Texture(this.canvas.gl, {
        generateMipmaps: false,
        width: 1920,
        height: 1080,
      })

      // Create video with attributes that let it autoplay
      // Check update loop to see when video is attached to texture
      const introVideo = document.createElement('video')
      introVideo.src = this.elements.intro.getAttribute('data-src')

      // Disclaimer: video autoplay is a confusing, constantly-changing browser feature.
      // The best approach is to never assume that it will work, and therefore prepare for a fallback.
      // Tested on mac: Chrome, Safari, Firefox; android: chrome
      introVideo.loop = true
      introVideo.muted = true
      introVideo.play()

      // TODO: test ios. Possible add following
      introVideo.setAttribute('crossorigin', 'anonymous')
      introVideo.setAttribute('webkit-playsinline', true)
      introVideo.setAttribute('playsinline', true)

      this.onAssetLoaded()

      window.MEDIAS[this.elements.intro.getAttribute('data-src')] = introVideo
      window.TEXTURES[this.elements.intro.getAttribute('data-src')] = texture
    }

    {
      const tex = new Texture(this.canvas.gl, {
        generateMipmaps: false,
      })

      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = './assets/fonts/SecularOne-Regular.png'
      // image.src = media.getAttribute(isWebPSupported ? 'data-src-webp' : 'data-src')

      image.onload = () => {
        tex.image = image
        this.onAssetLoaded()
      }

      fetch('./assets/fonts/SecularOne-Regular.json')
        .then(data => { return data.json() })
        .then((font) => {
          const text = new Text({
            font,
            text: 'Jean Marques',
            width: 8,
            align: 'center',
            letterSpacing: -0.05,
            size: 1,
            lineHeight: 1,
          })

          const geo = new Geometry(this.canvas.gl, {
            position: { size: 3, data: text.buffers.position },
            uv: { size: 2, data: text.buffers.uv },
            // id provides a per-character index, for effects that may require it
            id: { size: 1, data: text.buffers.id },
            index: { data: text.buffers.index },
          })

          window.FONTS['firasansfont'] = { text: text, geometry: geo }
          this.onAssetLoaded()
        })

      window.MEDIAS['firasansbold'] = image
      window.TEXTURES['firasansbold'] = tex
    }

    this.elements.medias.forEach(media => {
      const mediaType = media.getAttribute('data-media-type')
      if (mediaType === 'video') {
        const texture = new Texture(this.canvas.gl, {
          generateMipmaps: false,
          width: 1920,
          height: 1080,
        })

        // Create video with attributes that let it autoplay
        // Check update loop to see when video is attached to texture
        const video = document.createElement('video')
        video.src = media.getAttribute('data-src')

        // Disclaimer: video autoplay is a confusing, constantly-changing browser feature.
        // The best approach is to never assume that it will work, and therefore prepare for a fallback.
        // Tested on mac: Chrome, Safari, Firefox; android: chrome
        video.loop = true
        video.muted = true
        video.play()

        // TODO: test ios. Possible add following
        video.setAttribute('crossorigin', 'anonymous')
        video.setAttribute('webkit-playsinline', true)
        video.setAttribute('playsinline', true)

        this.onAssetLoaded()

        window.MEDIAS[media.getAttribute('data-src')] = video
        window.TEXTURES[media.getAttribute('data-src')] = texture
      } else {
        const texture = new Texture(this.canvas.gl, {
          generateMipmaps: false,
        })

        const image = new window.Image()
        image.src = media.getAttribute(isWebPSupported ? 'data-src-webp' : 'data-src')
        image.crossOrigin = 'anonymous'
        media.src = media.getAttribute(isWebPSupported ? 'data-src-webp' : 'data-src')

        image.onload = () => {
          texture.image = media
          this.onAssetLoaded()
        }

        window.MEDIAS[media.getAttribute('data-src')] = image
        window.TEXTURES[media.getAttribute('data-src')] = texture
      }
    })
  }

  async onAssetLoaded() {
    this.length++
    // const percent = this.length / this.elements.medias.length
    const percent = this.length / this.assetsLength

    this.elements.progressIn.style.width = `${Math.round(percent * 100)}%`

    // const timeline = gsap.timeline()
    // timeline
    //   .set(this.elements.progressIn, {
    //     width: '0%',
    //   })
    //   .to(this.elements.progressIn, {
    //     width: `${Math.round(percent * 100)}%`,
    //   })

    // once it's 100%
    // if (percent === 1) this.onComplete()
    if (percent >= 1) {
      await delay(500)
      this.onComplete()
    }
  }

  onComplete() {
    return new Promise(resolve => {
      // this.animateOut = gsap.timeline({
      //   delay: 1,
      // })

      // this.animateOut.to(
      //   [...this.elements.titleSpans,
      //   this.elements.number,
      //   this.elements.progress,
      //   this.elements.progressIn,
      //   ],
      //   {
      //     autoAlpha: 0,
      //     duration: 1.5,
      //     ease: 'expo.out',
      //     stagger: -0.1,
      //     y: '100%',
      //   })

      // this.animateOut.to(this.element, {
      //   autoAlpha: 0,
      // })

      resolve(this.emit('completed'))

      // resolve(
      // this.animateOut.call(() => {
      // this.emit('completed')
      // })
      // )
    })
  }

  destroy() {
    // this.element.parentNode.removeChild(this.element)
  }
}